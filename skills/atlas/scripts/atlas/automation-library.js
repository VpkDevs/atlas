#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const AUTOMATION_DIR = path.join(ROOT, 'automation-library');
const PLACEHOLDER_PATTERN = /\[([A-Z][A-Z0-9_ -]{2,})\]/g;
const ENV_PATTERN = /process\.env\.([A-Z][A-Z0-9_]+)/g;

function workflowFiles(dir = AUTOMATION_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.json') && file !== 'manifest.json')
    .sort()
    .map((file) => path.join(dir, file));
}

function readWorkflow(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeWorkflow(filePath, workflow) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(workflow, null, 2)}\n`);
}

function walkValues(value, visitor) {
  if (Array.isArray(value)) {
    value.forEach((item) => walkValues(item, visitor));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => walkValues(item, visitor));
  } else if (typeof value === 'string') {
    visitor(value);
  }
}

function unique(values) {
  return [...new Set(values)].sort();
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function typeVersionFor(type) {
  if (type === 'n8n-nodes-base.webhook') return 2;
  if (type === 'n8n-nodes-base.httpRequest') return 4.2;
  if (type === 'n8n-nodes-base.if') return 2;
  if (type === 'n8n-nodes-base.scheduleTrigger') return 1.2;
  if (type === 'n8n-nodes-base.wait') return 1.1;
  return 1;
}

function inferPlaceholders(workflow) {
  const placeholders = [];
  walkValues(workflow, (value) => {
    for (const match of value.matchAll(PLACEHOLDER_PATTERN)) {
      placeholders.push(match[1].trim().replace(/\s+/g, '_'));
    }
  });
  return unique(placeholders);
}

function inferEnvVars(workflow) {
  const envVars = [];
  walkValues(workflow, (value) => {
    for (const match of value.matchAll(ENV_PATTERN)) envVars.push(match[1]);
    for (const match of value.matchAll(PLACEHOLDER_PATTERN)) {
      const token = match[1].trim().replace(/\s+/g, '_');
      if (token.includes('_KEY') || token.includes('_TOKEN') || token.includes('_SECRET') || token.includes('_WEBHOOK') || token.includes('_ID')) {
        envVars.push(token);
      }
    }
  });
  return unique([...(workflow.meta?.atlas?.required_env || []), ...envVars]);
}

function connectionTargets(connections) {
  const targets = [];
  for (const [source, groups] of Object.entries(connections || {})) {
    for (const outputs of Object.values(groups || {})) {
      if (!Array.isArray(outputs)) continue;
      for (const output of outputs) {
        const edges = Array.isArray(output) ? output : [output];
        for (const edge of edges) {
          if (edge && edge.node) targets.push({ source, target: edge.node });
        }
      }
    }
  }
  return targets;
}

function validateWorkflow(workflow, filePath = '<memory>') {
  const errors = [];
  const warnings = [];
  const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
  const names = nodes.map((node) => node.name).filter(Boolean);
  const nameSet = new Set(names);
  const placeholders = inferPlaceholders(workflow);
  const required_env = inferEnvVars(workflow);
  const triggerTypes = ['n8n-nodes-base.webhook', 'n8n-nodes-base.scheduleTrigger', 'n8n-nodes-base.cron'];

  if (!workflow.name || typeof workflow.name !== 'string') errors.push('workflow.name must be a non-empty string');
  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) errors.push('workflow.nodes must be a non-empty array');
  if (!workflow.connections || typeof workflow.connections !== 'object') errors.push('workflow.connections must be an object');
  if (names.length !== nodes.length) errors.push('every node must have a name');
  if (nameSet.size !== names.length) errors.push('node names must be unique');

  for (const node of nodes) {
    if (!node.type) errors.push(`${node.name || '<unnamed>'}: missing node type`);
    if (!node.typeVersion) warnings.push(`${node.name || '<unnamed>'}: missing typeVersion`);
    if (!node.id) warnings.push(`${node.name || '<unnamed>'}: missing stable id`);
    if (!Array.isArray(node.position) || node.position.length !== 2) warnings.push(`${node.name || '<unnamed>'}: missing 2D position`);
  }

  if (!nodes.some((node) => triggerTypes.includes(node.type))) {
    errors.push('workflow needs a webhook, schedule, or cron trigger');
  }

  for (const { source, target } of connectionTargets(workflow.connections)) {
    if (!nameSet.has(source)) errors.push(`connection source does not exist: ${source}`);
    if (!nameSet.has(target)) errors.push(`connection target does not exist: ${target}`);
  }

  if (!workflow.meta?.atlas) warnings.push('missing meta.atlas metadata');
  if (!required_env.length) warnings.push('no required env vars declared or inferred');
  if (placeholders.length) warnings.push(`contains placeholders: ${placeholders.join(', ')}`);

  const readiness = Math.max(0, Math.min(100, 100 - errors.length * 30 - warnings.length * 5));
  return {
    file: path.basename(filePath),
    name: workflow.name || path.basename(filePath),
    ok: errors.length === 0,
    readiness,
    nodes: nodes.length,
    trigger_nodes: nodes.filter((node) => triggerTypes.includes(node.type)).map((node) => node.name),
    required_env,
    placeholders,
    errors,
    warnings,
  };
}

function buildManifest(dir = AUTOMATION_DIR) {
  const workflows = workflowFiles(dir).map((file) => validateWorkflow(readWorkflow(file), file));
  const failed = workflows.filter((workflow) => !workflow.ok).length;
  const averageReadiness = workflows.length
    ? Math.round((workflows.reduce((sum, workflow) => sum + workflow.readiness, 0) / workflows.length) * 10) / 10
    : 0;
  return {
    generated_at: new Date().toISOString(),
    workflow_count: workflows.length,
    failed,
    average_readiness: averageReadiness,
    required_env: unique(workflows.flatMap((workflow) => workflow.required_env)),
    workflows,
  };
}

function node(id, name, type, parameters, position, extra = {}) {
  return {
    id,
    name,
    type,
    typeVersion: extra.typeVersion || 1,
    position,
    parameters: parameters || {},
    ...Object.fromEntries(Object.entries(extra).filter(([key]) => key !== 'typeVersion')),
  };
}

function codeNode(id, name, jsCode, position) {
  return node(id, name, 'n8n-nodes-base.function', { functionCode: jsCode.trim() }, position);
}

function httpNode(id, name, parameters, position) {
  return node(id, name, 'n8n-nodes-base.httpRequest', parameters, position, { typeVersion: 4.2 });
}

function scheduleNode(id, name, interval, position) {
  return node(id, name, 'n8n-nodes-base.scheduleTrigger', {
    rule: { interval: [interval] },
  }, position, { typeVersion: 1.2 });
}

function webhookNode(id, name, pathName, position) {
  return node(id, name, 'n8n-nodes-base.webhook', {
    httpMethod: 'POST',
    path: pathName,
    responseMode: 'responseNode',
    options: {},
  }, position, { typeVersion: 2, webhookId: pathName });
}

function ifNode(id, name, conditions, position) {
  return node(id, name, 'n8n-nodes-base.if', { conditions }, position, { typeVersion: 2 });
}

function emailNode(id, name, subject, html, position) {
  return node(id, name, 'n8n-nodes-base.emailSend', {
    fromEmail: '={{$env.FROM_EMAIL || "founder@example.com"}}',
    toEmail: '={{$json.email || $env.FOUNDER_EMAIL}}',
    subject,
    html,
  }, position, { credentials: { smtp: { id: '[SMTP_CREDENTIAL_ID]', name: 'SMTP / Resend SMTP' } } });
}

function slackNode(id, name, text, position) {
  return httpNode(id, name, {
    method: 'POST',
    url: '={{$env.SLACK_WEBHOOK_URL}}',
    sendBody: true,
    bodyParameters: { parameters: [{ name: 'text', value: text }] },
  }, position);
}

function connect(...names) {
  const connections = {};
  for (let i = 0; i < names.length - 1; i++) {
    connections[names[i]] = { main: [[{ node: names[i + 1], type: 'main', index: 0 }]] };
  }
  return connections;
}

function atlasWorkflow(slug, name, description, requiredEnv, category, nodes, connections) {
  return {
    name,
    active: false,
    nodes,
    connections,
    settings: { executionOrder: 'v1', saveExecutionProgress: true, saveManualExecutions: true },
    staticData: null,
    tags: ['atlas', category],
    meta: {
      atlas: {
        slug,
        category,
        description,
        required_env: requiredEnv,
        generated_by: 'scripts/atlas/automation-library.js',
        activation_gate: 'replace placeholders, set credentials, run once manually, then activate',
      },
    },
  };
}

function builtinWorkflows() {
  const weeklyDigest = atlasWorkflow(
    'weekly-founder-digest',
    'Atlas: Weekly Founder Digest',
    'Pulls revenue, product, uptime, and error signals into one founder email and Slack summary.',
    ['STRIPE_SECRET_KEY', 'POSTHOG_API_KEY', 'POSTHOG_PROJECT_ID', 'BETTER_UPTIME_API_KEY', 'SENTRY_AUTH_TOKEN', 'FOUNDER_EMAIL', 'SLACK_WEBHOOK_URL'],
    'ops',
    [
      scheduleNode('weekly-trigger', 'Every Monday 8am', { field: 'weeks', weeksInterval: 1, triggerAtDay: [1], triggerAtHour: 8 }, [-900, 0]),
      httpNode('stripe-mrr', 'Stripe MRR Snapshot', { method: 'GET', url: 'https://api.stripe.com/v1/subscriptions?status=active&limit=100', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth' }, [-660, -240]),
      httpNode('posthog-activation', 'PostHog Activation Snapshot', { method: 'GET', url: '={{"https://app.posthog.com/api/projects/" + $env.POSTHOG_PROJECT_ID + "/insights/trend/"}}', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth' }, [-660, -80]),
      httpNode('better-uptime', 'Better Uptime Snapshot', { method: 'GET', url: 'https://betteruptime.com/api/v2/monitors', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth' }, [-660, 80]),
      httpNode('sentry-issues', 'Sentry Issue Snapshot', { method: 'GET', url: '={{$env.SENTRY_ISSUES_URL || "https://sentry.io/api/0/organizations/[SENTRY_ORG]/issues/"}}', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth' }, [-660, 240]),
      codeNode('compose-digest', 'Compose Digest', `
const now = new Date().toISOString();
return [{
  json: {
    email: $env.FOUNDER_EMAIL,
    subject: 'Atlas weekly digest - ' + now.slice(0, 10),
    summary: 'Revenue, activation, uptime, and error snapshots collected. Review attached execution data before Monday planning.',
    actions: [
      'Fix any monitor that is not green',
      'Investigate top Sentry issue',
      'Pick one activation bottleneck',
      'Ship one revenue experiment'
    ]
  }
}];
`, [-360, 0]),
      emailNode('send-founder-email', 'Send Founder Email', '={{$json.subject}}', '={{"<h2>Atlas Weekly Digest</h2><p>" + $json.summary + "</p><ul>" + $json.actions.map(a => "<li>" + a + "</li>").join("") + "</ul>"}}', [-80, -80]),
      slackNode('post-slack-summary', 'Post Slack Summary', '={{"*Atlas Weekly Digest*\\n" + $json.summary + "\\nActions:\\n- " + $json.actions.join("\\n- ")}}', [-80, 120]),
    ],
    {
      'Every Monday 8am': { main: [[
        { node: 'Stripe MRR Snapshot', type: 'main', index: 0 },
        { node: 'PostHog Activation Snapshot', type: 'main', index: 0 },
        { node: 'Better Uptime Snapshot', type: 'main', index: 0 },
        { node: 'Sentry Issue Snapshot', type: 'main', index: 0 },
      ]] },
      'Stripe MRR Snapshot': { main: [[{ node: 'Compose Digest', type: 'main', index: 0 }]] },
      'PostHog Activation Snapshot': { main: [[{ node: 'Compose Digest', type: 'main', index: 0 }]] },
      'Better Uptime Snapshot': { main: [[{ node: 'Compose Digest', type: 'main', index: 0 }]] },
      'Sentry Issue Snapshot': { main: [[{ node: 'Compose Digest', type: 'main', index: 0 }]] },
      'Compose Digest': { main: [[
        { node: 'Send Founder Email', type: 'main', index: 0 },
        { node: 'Post Slack Summary', type: 'main', index: 0 },
      ]] },
    },
  );

  const incident = atlasWorkflow(
    'uptime-incident-response',
    'Atlas: Uptime Incident Response',
    'Checks the production URL, opens an incident when health fails, alerts the founder, and schedules a follow-up.',
    ['LIVE_URL', 'SLACK_WEBHOOK_URL', 'LINEAR_API_KEY', 'FOUNDER_EMAIL'],
    'monitoring',
    [
      scheduleNode('health-trigger', 'Every 5 Minutes', { field: 'minutes', minutesInterval: 5 }, [-840, 0]),
      httpNode('health-check', 'Check Live URL', { method: 'GET', url: '={{$env.LIVE_URL + "/health"}}', options: { timeout: 10000 } }, [-600, 0]),
      ifNode('is-down', 'Health Failed?', { options: { caseSensitive: true }, conditions: [{ leftValue: '={{$json.statusCode || 200}}', operation: 'largerEqual', rightValue: 400 }] }, [-360, 0]),
      slackNode('alert-slack', 'Alert Slack', '={{":rotating_light: Atlas incident: " + $env.LIVE_URL + " health check failed. Status: " + ($json.statusCode || "unknown")}}', [-120, -120]),
      httpNode('open-linear', 'Open Linear Incident', { method: 'POST', url: 'https://api.linear.app/graphql', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth', sendBody: true, bodyContentType: 'json', jsonBody: '={{JSON.stringify({query:"mutation IssueCreate($input: IssueCreateInput!) { issueCreate(input: $input) { issue { id title url } } }",variables:{input:{title:"Atlas incident: production health check failed",description:"Health check failed for " + $env.LIVE_URL + ". Inspect logs, rollback if needed, and update incident notes."}}})}}' }, [-120, 80]),
      emailNode('email-founder', 'Email Founder', 'Atlas incident: production health failed', '={{"<p>Atlas detected a production health failure for " + $env.LIVE_URL + ".</p><p>Slack and Linear have been notified.</p>"}}', [160, 0]),
    ],
    {
      'Every 5 Minutes': { main: [[{ node: 'Check Live URL', type: 'main', index: 0 }]] },
      'Check Live URL': { main: [[{ node: 'Health Failed?', type: 'main', index: 0 }]] },
      'Health Failed?': { main: [[
        { node: 'Alert Slack', type: 'main', index: 0 },
        { node: 'Open Linear Incident', type: 'main', index: 0 },
        { node: 'Email Founder', type: 'main', index: 0 },
      ]] },
    },
  );

  const support = atlasWorkflow(
    'support-triage-autoresponder',
    'Atlas: Support Triage Autoresponder',
    'Receives support requests, classifies urgency, sends safe first response, and escalates P0/P1 issues.',
    ['SUPPORT_SHARED_SECRET', 'FOUNDER_EMAIL', 'SLACK_WEBHOOK_URL'],
    'support',
    [
      webhookNode('support-webhook', 'Support Webhook', 'atlas-support-triage', [-900, 0]),
      codeNode('classify-ticket', 'Classify Ticket', `
const body = $json.body || $json;
const text = String(body.message || body.text || '').toLowerCase();
const p0 = /charged|billing|security|breach|down|cannot access|data loss/.test(text);
const p1 = /bug|broken|error|failed|refund/.test(text);
return [{
  json: {
    email: body.email,
    message: body.message || body.text,
    priority: p0 ? 'P0' : p1 ? 'P1' : 'P2',
    response: p0
      ? 'We received this and are escalating it immediately. Atlas is checking the system now.'
      : 'Thanks for the note. We received it and will follow up with the next useful step shortly.'
  }
}];
`, [-640, 0]),
      emailNode('send-response', 'Send Safe First Response', 'We received your request', '={{"<p>" + $json.response + "</p><p>Your message:</p><blockquote>" + $json.message + "</blockquote>"}}', [-360, -120]),
      ifNode('needs-escalation', 'Needs Escalation?', { conditions: [{ leftValue: '={{$json.priority}}', operation: 'in', rightValue: 'P0,P1' }] }, [-360, 120]),
      slackNode('escalate-slack', 'Escalate Slack', '={{":warning: " + $json.priority + " support ticket from " + $json.email + "\\n" + $json.message}}', [-80, 120]),
    ],
    {
      'Support Webhook': { main: [[{ node: 'Classify Ticket', type: 'main', index: 0 }]] },
      'Classify Ticket': { main: [[
        { node: 'Send Safe First Response', type: 'main', index: 0 },
        { node: 'Needs Escalation?', type: 'main', index: 0 },
      ]] },
      'Needs Escalation?': { main: [[{ node: 'Escalate Slack', type: 'main', index: 0 }]] },
    },
  );

  const revenueMilestones = atlasWorkflow(
    'revenue-milestone-celebration',
    'Atlas: Revenue Milestone Celebration',
    'Watches Stripe MRR and posts founder-visible celebration plus next revenue target when milestones are crossed.',
    ['STRIPE_SECRET_KEY', 'SLACK_WEBHOOK_URL', 'FOUNDER_EMAIL'],
    'revenue',
    [
      scheduleNode('daily-revenue-trigger', 'Daily Revenue Check', { field: 'hours', hoursInterval: 24 }, [-760, 0]),
      httpNode('stripe-subscriptions', 'Fetch Stripe Subscriptions', { method: 'GET', url: 'https://api.stripe.com/v1/subscriptions?status=active&limit=100', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth' }, [-520, 0]),
      codeNode('calculate-mrr', 'Calculate MRR Milestone', `
const subscriptions = $json.data || [];
const mrr = subscriptions.reduce((sum, sub) => {
  const cents = (sub.items?.data || []).reduce((itemSum, item) => itemSum + (item.price?.unit_amount || 0), 0);
  return sum + cents / 100;
}, 0);
const milestones = [1, 10, 100, 500, 1000, 5000, 10000];
const reached = milestones.filter(m => mrr >= m).pop() || 0;
const next = milestones.find(m => m > mrr) || Math.ceil((mrr + 1) / 10000) * 10000;
return [{ json: { mrr, reached, next, email: $env.FOUNDER_EMAIL } }];
`, [-280, 0]),
      ifNode('milestone-hit', 'Milestone Hit?', { conditions: [{ leftValue: '={{$json.reached}}', operation: 'larger', rightValue: 0 }] }, [-40, 0]),
      slackNode('slack-milestone', 'Post Milestone', '={{":tada: Revenue milestone reached: $" + $json.reached + " MRR. Current MRR: $" + Math.round($json.mrr) + ". Next target: $" + $json.next + "."}}', [200, -80]),
      emailNode('email-milestone', 'Email Milestone', 'Atlas revenue milestone reached', '={{"<p>MRR is now $" + Math.round($json.mrr) + ".</p><p>Next target: $" + $json.next + ".</p>"}}', [200, 100]),
    ],
    {
      'Daily Revenue Check': { main: [[{ node: 'Fetch Stripe Subscriptions', type: 'main', index: 0 }]] },
      'Fetch Stripe Subscriptions': { main: [[{ node: 'Calculate MRR Milestone', type: 'main', index: 0 }]] },
      'Calculate MRR Milestone': { main: [[{ node: 'Milestone Hit?', type: 'main', index: 0 }]] },
      'Milestone Hit?': { main: [[
        { node: 'Post Milestone', type: 'main', index: 0 },
        { node: 'Email Milestone', type: 'main', index: 0 },
      ]] },
    },
  );

  const cancellation = atlasWorkflow(
    'cancellation-save-and-learn',
    'Atlas: Cancellation Save & Learn',
    'Handles cancellation events with a save offer, cancellation reason capture, and founder learning loop.',
    ['STRIPE_WEBHOOK_SECRET', 'RESEND_API_KEY', 'FOUNDER_EMAIL', 'SLACK_WEBHOOK_URL'],
    'retention',
    [
      webhookNode('cancellation-webhook', 'Stripe Cancellation Webhook', 'atlas-stripe-cancellation', [-860, 0]),
      codeNode('parse-cancellation', 'Parse Cancellation', `
const event = $json.body || $json;
const object = event.data?.object || event;
return [{
  json: {
    customerId: object.customer,
    email: object.customer_email || object.email,
    canceledAt: new Date().toISOString(),
    reason: object.cancellation_details?.reason || 'unknown'
  }
}];
`, [-620, 0]),
      httpNode('send-save-email', 'Send Save Email', { method: 'POST', url: 'https://api.resend.com/emails', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth', sendBody: true, bodyContentType: 'json', jsonBody: '={{JSON.stringify({from:$env.FROM_EMAIL,to:$json.email,subject:"Before you go",html:"<p>Sorry to see you go. Reply with what went wrong and I will personally fix what I can.</p>"})}}' }, [-360, -100]),
      slackNode('notify-founder', 'Notify Founder', '={{":broken_heart: Cancellation from " + $json.email + ". Reason: " + $json.reason}}', [-360, 100]),
      emailNode('founder-learning-loop', 'Founder Learning Email', 'Cancellation learning loop', '={{"<p>Customer canceled: " + $json.email + "</p><p>Reason: " + $json.reason + "</p><p>Action: identify one product or positioning fix.</p>"}}', [-80, 0]),
    ],
    connect('Stripe Cancellation Webhook', 'Parse Cancellation', 'Send Save Email', 'Founder Learning Email'),
  );
  cancellation.connections['Parse Cancellation'].main[0].push({ node: 'Notify Founder', type: 'main', index: 0 });

  const leadFollowup = atlasWorkflow(
    'lead-magnet-followup',
    'Atlas: Lead Magnet Follow-Up',
    'Turns a lead magnet signup into a seven-day conversion sequence with behavior-aware founder alerting.',
    ['RESEND_API_KEY', 'POSTHOG_API_KEY', 'POSTHOG_PROJECT_ID', 'SLACK_WEBHOOK_URL'],
    'growth',
    [
      webhookNode('lead-webhook', 'Lead Signup Webhook', 'atlas-lead-signup', [-860, 0]),
      codeNode('normalize-lead', 'Normalize Lead', `
const body = $json.body || $json;
return [{ json: { email: body.email, source: body.source || 'lead-magnet', signedUpAt: new Date().toISOString() } }];
`, [-620, 0]),
      httpNode('track-lead', 'Track Lead in PostHog', { method: 'POST', url: '={{"https://app.posthog.com/capture/"}}', sendBody: true, bodyContentType: 'json', jsonBody: '={{JSON.stringify({api_key:$env.POSTHOG_API_KEY,event:"lead_magnet_signup",distinct_id:$json.email,properties:{source:$json.source}})}}' }, [-360, -120]),
      httpNode('send-day-zero', 'Send Day 0 Email', { method: 'POST', url: 'https://api.resend.com/emails', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth', sendBody: true, bodyContentType: 'json', jsonBody: '={{JSON.stringify({from:$env.FROM_EMAIL,to:$json.email,subject:"Here is the resource",html:"<p>Here is the resource you asked for. Tomorrow I will send the fastest way to get value from it.</p>"})}}' }, [-360, 80]),
      node('wait-two-days', 'Wait 2 Days', 'n8n-nodes-base.wait', { amount: 2, unit: 'days' }, [-120, 80], { typeVersion: 1.1 }),
      httpNode('send-conversion-email', 'Send Conversion Email', { method: 'POST', url: 'https://api.resend.com/emails', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth', sendBody: true, bodyContentType: 'json', jsonBody: '={{JSON.stringify({from:$env.FROM_EMAIL,to:$json.email,subject:"Want this done for you?",html:"<p>If you want the outcome without the setup, here is the paid path.</p>"})}}' }, [120, 80]),
      slackNode('notify-new-lead', 'Notify New Lead', '={{":mag: New lead from " + $json.source + ": " + $json.email}}', [-120, -120]),
    ],
    {
      'Lead Signup Webhook': { main: [[{ node: 'Normalize Lead', type: 'main', index: 0 }]] },
      'Normalize Lead': { main: [[
        { node: 'Track Lead in PostHog', type: 'main', index: 0 },
        { node: 'Send Day 0 Email', type: 'main', index: 0 },
        { node: 'Notify New Lead', type: 'main', index: 0 },
      ]] },
      'Send Day 0 Email': { main: [[{ node: 'Wait 2 Days', type: 'main', index: 0 }]] },
      'Wait 2 Days': { main: [[{ node: 'Send Conversion Email', type: 'main', index: 0 }]] },
    },
  );

  return {
    'weekly-founder-digest.json': weeklyDigest,
    'uptime-incident-response.json': incident,
    'support-triage-autoresponder.json': support,
    'revenue-milestone-celebration.json': revenueMilestones,
    'cancellation-save-and-learn.json': cancellation,
    'lead-magnet-followup.json': leadFollowup,
  };
}

function enhanceWorkflow(workflow, fileName) {
  const validation = validateWorkflow(workflow, fileName);
  const slug = path.basename(fileName, '.json');
  const nodes = Array.isArray(workflow.nodes)
    ? workflow.nodes.map((workflowNode, index) => ({
      ...workflowNode,
      id: workflowNode.id || `${slugify(slug)}-${slugify(workflowNode.name || `node-${index + 1}`)}`,
      typeVersion: workflowNode.typeVersion || typeVersionFor(workflowNode.type),
      position: Array.isArray(workflowNode.position) && workflowNode.position.length === 2
        ? workflowNode.position
        : [index * 220, 0],
    }))
    : workflow.nodes;
  return {
    ...workflow,
    nodes,
    active: Boolean(workflow.active),
    settings: {
      executionOrder: 'v1',
      saveExecutionProgress: true,
      saveManualExecutions: true,
      ...(workflow.settings || {}),
    },
    tags: unique([...(workflow.tags || []), 'atlas']),
    meta: {
      ...(workflow.meta || {}),
      atlas: {
        slug,
        category: workflow.meta?.atlas?.category || 'library',
        description: workflow.description || workflow.meta?.atlas?.description || workflow._comment || 'Atlas automation workflow',
        required_env: validation.required_env,
        placeholders: validation.placeholders,
        activation_gate: 'replace placeholders, configure credentials, run once manually, then activate',
        ...(workflow.meta?.atlas || {}),
      },
    },
  };
}

function seedWorkflows(dir = AUTOMATION_DIR) {
  const written = [];
  for (const [file, workflow] of Object.entries(builtinWorkflows())) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) {
      writeWorkflow(filePath, workflow);
      written.push(file);
    }
  }
  return written;
}

function enhanceExisting(dir = AUTOMATION_DIR) {
  const changed = [];
  for (const filePath of workflowFiles(dir)) {
    const workflow = readWorkflow(filePath);
    const enhanced = enhanceWorkflow(workflow, path.basename(filePath));
    if (JSON.stringify(workflow) !== JSON.stringify(enhanced)) {
      writeWorkflow(filePath, enhanced);
      changed.push(path.basename(filePath));
    }
  }
  return changed;
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function main(argv = process.argv.slice(2)) {
  const command = argv[0] || 'validate';
  if (command === 'seed') {
    const written = seedWorkflows();
    const enhanced = enhanceExisting();
    printJson({ written, enhanced, manifest: buildManifest() });
    return;
  }
  if (command === 'manifest') {
    printJson(buildManifest());
    return;
  }
  if (command === 'validate') {
    const manifest = buildManifest();
    printJson(manifest);
    process.exitCode = manifest.failed ? 1 : 0;
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  AUTOMATION_DIR,
  buildManifest,
  enhanceExisting,
  inferEnvVars,
  inferPlaceholders,
  seedWorkflows,
  validateWorkflow,
  workflowFiles,
};
