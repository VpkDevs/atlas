---\nname: execution\ndescription: API execution, deployment, and credential acquisition protocols.\n---\n\n# API Execution Engine\n\n# API Execution Engine v2.0 - Direct API Integration

**The #2 gap in hands-off-gaps.md: Atlas should call APIs, not describe calling them.**

## Core Principle

**If a tool has an API and its key exists in `.env` — Atlas calls that API. It does not describe using it.**

## API Registry

```javascript
const API_REGISTRY = {
  // Email & Communication
  'resend': {
    key_pattern: 'RESEND_API_KEY',
    base_url: 'https://api.resend.com',
    capabilities: ['send_email', 'create_audience', 'create_contact'],
    docs: 'https://resend.com/docs'
  },
  'sendgrid': {
    key_pattern: 'SENDGRID_API_KEY',
    base_url: 'https://api.sendgrid.com/v3',
    capabilities: ['send_email', 'create_template', 'schedule_email'],
    docs: 'https://docs.sendgrid.com'
  },
  
  // Payment Processing
  'stripe': {
    key_pattern: 'STRIPE_SECRET_KEY',
    base_url: 'https://api.stripe.com/v1',
    capabilities: ['create_product', 'create_price', 'create_webhook', 'list_customers'],
    docs: 'https://stripe.com/docs/api'
  },
  
  // Social Media
  'buffer': {
    key_pattern: 'BUFFER_ACCESS_TOKEN',
    base_url: 'https://api.bufferapp.com/1',
    capabilities: ['schedule_post', 'list_profiles', 'create_post'],
    docs: 'https://buffer.com/developers/api'
  },
  'twitter': {
    key_pattern: 'TWITTER_API_KEY',
    base_url: 'https://api.twitter.com/2',
    capabilities: ['create_tweet', 'get_user', 'search_tweets'],
    docs: 'https://developer.twitter.com/en/docs'
  },
  
  // Monitoring & Analytics
  'better_uptime': {
    key_pattern: 'BETTER_UPTIME_API_KEY',
    base_url: 'https://betteruptime.com/api/v2',
    capabilities: ['create_monitor', 'list_monitors', 'create_heartbeat'],
    docs: 'https://betteruptime.com/docs/api'
  },
  'sentry': {
    key_pattern: 'SENTRY_AUTH_TOKEN',
    base_url: 'https://sentry.io/api/0',
    capabilities: ['create_project', 'list_issues', 'create_alert'],
    docs: 'https://docs.sentry.io/api'
  },
  'posthog': {
    key_pattern: 'POSTHOG_API_KEY',
    base_url: 'https://app.posthog.com/api',
    capabilities: ['capture_event', 'create_dashboard', 'create_insight'],
    docs: 'https://posthog.com/docs/api'
  },
  
  // Project Management
  'linear': {
    key_pattern: 'LINEAR_API_KEY',
    base_url: 'https://api.linear.app/graphql',
    capabilities: ['create_issue', 'list_issues', 'update_issue'],
    docs: 'https://developers.linear.app/docs'
  },
  'github': {
    key_pattern: 'GITHUB_TOKEN',
    base_url: 'https://api.github.com',
    capabilities: ['create_repo', 'create_issue', 'create_pr'],
    docs: 'https://docs.github.com/en/rest'
  },
  
  // Notifications
  'slack': {
    key_pattern: 'SLACK_WEBHOOK_URL',
    base_url: null,  // Webhook-based
    capabilities: ['send_message'],
    docs: 'https://api.slack.com/messaging/webhooks'
  },
  'discord': {
    key_pattern: 'DISCORD_WEBHOOK_URL',
    base_url: null,  // Webhook-based
    capabilities: ['send_message'],
    docs: 'https://discord.com/developers/docs/resources/webhook'
  },
  
  // Cloud Platforms
  'vercel': {
    key_pattern: 'VERCEL_TOKEN',
    base_url: 'https://api.vercel.com',
    capabilities: ['deploy', 'add_env_var', 'list_deployments'],
    docs: 'https://vercel.com/docs/rest-api'
  },
  'railway': {
    key_pattern: 'RAILWAY_TOKEN',
    base_url: 'https://backboard.railway.app/graphql/v2',
    capabilities: ['deploy', 'add_variable', 'list_services'],
    docs: 'https://docs.railway.app/reference/public-api'
  },
  
  // CRM & Support
  'crisp': {
    key_pattern: 'CRISP_API_KEY',
    base_url: 'https://api.crisp.chat/v1',
    capabilities: ['send_message', 'create_conversation', 'add_note'],
    docs: 'https://docs.crisp.chat/api/v1'
  },
  'intercom': {
    key_pattern: 'INTERCOM_ACCESS_TOKEN',
    base_url: 'https://api.intercom.io',
    capabilities: ['create_user', 'send_message', 'create_note'],
    docs: 'https://developers.intercom.com/docs'
  }
}
```

## API Detection & Initialization

```javascript
FUNCTION detect_available_apis():
  available_apis = []
  
  // Read .env file
  env_vars = read_env_file('.env')
  
  // Check each API in registry
  for (api_name, api_config) in API_REGISTRY:
    key_pattern = api_config.key_pattern
    
    // Check if key exists in environment
    if env_vars.has(key_pattern):
      api_key = env_vars.get(key_pattern)
      
      // Verify key is not empty or placeholder
      if api_key and not is_placeholder(api_key):
        available_apis.push({
          name: api_name,
          config: api_config,
          key: api_key,
          verified: false
        })
  
  return available_apis

FUNCTION is_placeholder(value):
  placeholders = [
    'your_key_here',
    'replace_me',
    'xxx',
    'placeholder',
    'changeme'
  ]
  
  return placeholders.some(p => value.toLowerCase().includes(p))

FUNCTION verify_api_key(api):
  // Make a simple API call to verify the key works
  verification_endpoints = {
    'stripe': '/v1/customers?limit=1',
    'resend': '/emails',
    'sendgrid': '/mail/send',
    'buffer': '/profiles.json',
    'better_uptime': '/monitors',
    'posthog': '/api/projects',
    'linear': '/graphql',
    'github': '/user'
  }
  
  endpoint = verification_endpoints[api.name]
  if not endpoint:
    return {verified: true, assumed: true}  // Assume valid if no verification endpoint
  
  try:
    response = http_request({
      method: 'GET',
      url: api.config.base_url + endpoint,
      headers: {
        'Authorization': `Bearer ${api.key}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    })
    
    if response.status in [200, 201, 204]:
      return {verified: true, assumed: false}
    else:
      return {verified: false, error: `HTTP ${response.status}`}
  
  catch error:
    return {verified: false, error: error.message}
```

## Email Automation (Resend/SendGrid)

```javascript
FUNCTION create_email_sequence(provider, sequence_config):
  switch provider:
    case 'resend':
      return create_resend_sequence(sequence_config)
    case 'sendgrid':
      return create_sendgrid_sequence(sequence_config)

FUNCTION create_resend_sequence(config):
  api_key = env.RESEND_API_KEY
  
  // Create audience
  audience_response = http_request({
    method: 'POST',
    url: 'https://api.resend.com/audiences',
    headers: {
      'Authorization': `Bearer ${api_key}`,
      'Content-Type': 'application/json'
    },
    body: {
      name: config.audience_name || 'Main List'
    }
  })
  
  audience_id = audience_response.data.id
  
  // Create email templates
  templates = []
  for email in config.emails:
    template_response = http_request({
      method: 'POST',
      url: 'https://api.resend.com/emails',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      },
      body: {
        from: config.from_email,
        to: '{{email}}',  // Template variable
        subject: email.subject,
        html: email.html,
        scheduled_at: email.delay_days ? calculate_delay(email.delay_days) : null
      }
    })
    
    templates.push({
      name: email.name,
      id: template_response.data.id,
      delay_days: email.delay_days
    })
  
  return {
    success: true,
    audience_id: audience_id,
    templates: templates,
    provider: 'resend'
  }

FUNCTION send_email(provider, email_data):
  switch provider:
    case 'resend':
      return http_request({
        method: 'POST',
        url: 'https://api.resend.com/emails',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: {
          from: email_data.from,
          to: email_data.to,
          subject: email_data.subject,
          html: email_data.html
        }
      })
    
    case 'sendgrid':
      return http_request({
        method: 'POST',
        url: 'https://api.sendgrid.com/v3/mail/send',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: {
          personalizations: [{
            to: [{email: email_data.to}]
          }],
          from: {email: email_data.from},
          subject: email_data.subject,
          content: [{
            type: 'text/html',
            value: email_data.html
          }]
        }
      })
```

## Social Media Automation (Buffer)

```javascript
FUNCTION schedule_social_posts(posts):
  if not env.BUFFER_ACCESS_TOKEN:
    return {success: false, error: 'BUFFER_ACCESS_TOKEN not found'}
  
  // Get Buffer profiles
  profiles_response = http_request({
    method: 'GET',
    url: 'https://api.bufferapp.com/1/profiles.json',
    params: {
      access_token: env.BUFFER_ACCESS_TOKEN
    }
  })
  
  profiles = profiles_response.data
  
  // Schedule posts
  scheduled_posts = []
  for post in posts:
    // Find matching profile
    profile = profiles.find(p => p.service == post.platform)
    
    if not profile:
      log_warning(`No Buffer profile found for ${post.platform}`)
      continue
    
    // Schedule post
    response = http_request({
      method: 'POST',
      url: 'https://api.bufferapp.com/1/updates/create.json',
      params: {
        access_token: env.BUFFER_ACCESS_TOKEN
      },
      body: {
        profile_ids: [profile.id],
        text: post.text,
        scheduled_at: post.scheduled_at,
        media: post.media || {}
      }
    })
    
    scheduled_posts.push({
      platform: post.platform,
      id: response.data.id,
      scheduled_at: post.scheduled_at,
      text: post.text.substring(0, 50) + '...'
    })
  
  return {
    success: true,
    scheduled_count: scheduled_posts.length,
    posts: scheduled_posts
  }
```

## Monitoring Setup (Better Uptime, Sentry)

```javascript
FUNCTION setup_monitoring(product_url):
  results = {}
  
  // Better Uptime
  if env.BETTER_UPTIME_API_KEY:
    results.better_uptime = create_uptime_monitors(product_url)
  
  // Sentry
  if env.SENTRY_AUTH_TOKEN:
    results.sentry = setup_sentry_project()
  
  // PostHog
  if env.POSTHOG_API_KEY:
    results.posthog = create_posthog_dashboards()
  
  return results

FUNCTION create_uptime_monitors(url):
  api_key = env.BETTER_UPTIME_API_KEY
  
  monitors = [
    {
      url: url,
      monitor_type: 'status',
      check_frequency: 60,  // 1 minute
      request_timeout: 30,
      confirmation_period: 0,
      monitor_group_id: null,
      pronounceable_name: extract_domain(url)
    },
    {
      url: url + '/api/health',
      monitor_type: 'status',
      check_frequency: 300,  // 5 minutes
      request_timeout: 30,
      confirmation_period: 0,
      pronounceable_name: extract_domain(url) + ' API'
    }
  ]
  
  created_monitors = []
  for monitor_config in monitors:
    response = http_request({
      method: 'POST',
      url: 'https://betteruptime.com/api/v2/monitors',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      },
      body: monitor_config
    })
    
    if response.status == 201:
      created_monitors.push({
        id: response.data.data.id,
        url: monitor_config.url,
        frequency: monitor_config.check_frequency
      })
  
  return {
    success: true,
    monitors: created_monitors
  }

FUNCTION setup_sentry_project():
  auth_token = env.SENTRY_AUTH_TOKEN
  org_slug = env.SENTRY_ORG_SLUG || 'my-org'
  
  // Create project
  project_response = http_request({
    method: 'POST',
    url: `https://sentry.io/api/0/teams/${org_slug}/my-team/projects/`,
    headers: {
      'Authorization': `Bearer ${auth_token}`,
      'Content-Type': 'application/json'
    },
    body: {
      name: env.PROJECT_NAME || 'my-project',
      platform: 'javascript'
    }
  })
  
  project_slug = project_response.data.slug
  dsn = project_response.data.keys[0].dsn.public
  
  // Create alert rules
  alert_response = http_request({
    method: 'POST',
    url: `https://sentry.io/api/0/projects/${org_slug}/${project_slug}/rules/`,
    headers: {
      'Authorization': `Bearer ${auth_token}`,
      'Content-Type': 'application/json'
    },
    body: {
      name: 'Critical Errors',
      conditions: [{
        id: 'sentry.rules.conditions.first_seen_event.FirstSeenEventCondition'
      }],
      actions: [{
        id: 'sentry.rules.actions.notify_event.NotifyEventAction'
      }],
      actionMatch: 'all',
      frequency: 30
    }
  })
  
  return {
    success: true,
    project_slug: project_slug,
    dsn: dsn,
    alert_rule_id: alert_response.data.id
  }
```

## Stripe Configuration

```javascript
FUNCTION configure_stripe_webhooks(webhook_url):
  api_key = env.STRIPE_SECRET_KEY
  
  // Create webhook endpoint
  response = http_request({
    method: 'POST',
    url: 'https://api.stripe.com/v1/webhook_endpoints',
    headers: {
      'Authorization': `Bearer ${api_key}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: url_encode({
      url: webhook_url,
      enabled_events: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'charge.succeeded',
        'charge.failed'
      ]
    })
  })
  
  return {
    success: response.status == 200,
    webhook_id: response.data.id,
    webhook_secret: response.data.secret
  }

FUNCTION create_stripe_products(products):
  api_key = env.STRIPE_SECRET_KEY
  created_products = []
  
  for product_config in products:
    // Create product
    product_response = http_request({
      method: 'POST',
      url: 'https://api.stripe.com/v1/products',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: url_encode({
        name: product_config.name,
        description: product_config.description
      })
    })
    
    product_id = product_response.data.id
    
    // Create price
    price_response = http_request({
      method: 'POST',
      url: 'https://api.stripe.com/v1/prices',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: url_encode({
        product: product_id,
        unit_amount: product_config.price * 100,  // Convert to cents
        currency: 'usd',
        recurring: {
          interval: product_config.interval || 'month'
        }
      })
    })
    
    created_products.push({
      name: product_config.name,
      product_id: product_id,
      price_id: price_response.data.id,
      amount: product_config.price
    })
  
  return {
    success: true,
    products: created_products
  }
```

## Notification Setup (Slack, Discord)

```javascript
FUNCTION send_slack_notification(message):
  webhook_url = env.SLACK_WEBHOOK_URL
  
  if not webhook_url:
    return {success: false, error: 'SLACK_WEBHOOK_URL not found'}
  
  response = http_request({
    method: 'POST',
    url: webhook_url,
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      text: message.text,
      blocks: message.blocks || null,
      attachments: message.attachments || null
    }
  })
  
  return {
    success: response.status == 200
  }

FUNCTION send_discord_notification(message):
  webhook_url = env.DISCORD_WEBHOOK_URL
  
  if not webhook_url:
    return {success: false, error: 'DISCORD_WEBHOOK_URL not found'}
  
  response = http_request({
    method: 'POST',
    url: webhook_url,
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      content: message.text,
      embeds: message.embeds || null
    }
  })
  
  return {
    success: response.status == 204
  }
```

## Integration with Automation Handoff

```text
// In automation-handoff.md, the module becomes:

PROCEDURE automation_handoff():

  1. DETECT available APIs
     apis = detect_available_apis()
     log_info("Found {apis.length} configured APIs")
  
  2. VERIFY API keys
     for api in apis:
       verification = verify_api_key(api)
       if verification.verified:
         log_success("✅ {api.name} API key verified")
         mark_api_confirmed(api.name)
       else:
         log_warning("⚠️ {api.name} API key invalid: {verification.error}")
  
  3. EMAIL AUTOMATION
     if has_api('resend') or has_api('sendgrid'):
       provider = has_api('resend') ? 'resend' : 'sendgrid'
       
       sequences = [
         {
           name: 'Welcome Sequence',
           emails: [
             {name: 'Welcome', subject: '...', html: '...', delay_days: 0},
             {name: 'Getting Started', subject: '...', html: '...', delay_days: 1},
             {name: 'Tips & Tricks', subject: '...', html: '...', delay_days: 3}
           ]
         }
       ]
       
       for sequence in sequences:
         result = create_email_sequence(provider, sequence)
         if result.success:
           log_success("✅ Created {sequence.name} with {result.templates.length} emails")
  
  4. SOCIAL MEDIA AUTOMATION
     if has_api('buffer'):
       posts = generate_30_day_content_calendar()
       result = schedule_social_posts(posts)
       if result.success:
         log_success("✅ Scheduled {result.scheduled_count} social posts")
  
  5. MONITORING SETUP
     if has_api('better_uptime') or has_api('sentry'):
       result = setup_monitoring(product_url)
       log_success("✅ Monitoring configured: {Object.keys(result).join(', ')}")
  
  6. STRIPE CONFIGURATION
     if has_api('stripe'):
       // Configure webhooks
       webhook_result = configure_stripe_webhooks(product_url + '/api/webhooks/stripe')
       
       // Create products if pricing is defined
       if pricing_config_exists():
         products_result = create_stripe_products(read_pricing_config())
         log_success("✅ Created {products_result.products.length} Stripe products")
  
  7. NOTIFICATION SETUP
     if has_api('slack') or has_api('discord'):
       test_message = {
         text: "🚀 Atlas automation setup complete for {product_name}"
       }
       
       if has_api('slack'):
         send_slack_notification(test_message)
       if has_api('discord'):
         send_discord_notification(test_message)
```

## Error Handling & Retry Logic

```javascript
FUNCTION http_request_with_retry(config, max_retries=3):
  for attempt in range(1, max_retries + 1):
    try:
      response = http_request(config)
      
      if response.status in [200, 201, 204]:
        return response
      
      if response.status == 429:  // Rate limit
        wait_time = extract_retry_after(response.headers) || (attempt * 2)
        log_info("Rate limited, waiting {wait_time}s...")
        sleep(wait_time)
        continue
      
      if response.status >= 500:  // Server error
        log_warning("Server error (HTTP {response.status}), retrying...")
        sleep(attempt * 2)
        continue
      
      // Client error, don't retry
      return response
    
    catch error:
      if attempt == max_retries:
        throw error
      
      log_warning("Request failed: {error.message}, retrying...")
      sleep(attempt * 2)
  
  throw new Error("Max retries exceeded")
```

## Acceptance Criteria

- [ ] Detects all APIs with keys in .env
- [ ] Verifies API keys before use
- [ ] Creates email sequences automatically
- [ ] Schedules social media posts automatically
- [ ] Configures monitoring automatically
- [ ] Sets up Stripe webhooks and products
- [ ] Sends test notifications
- [ ] Handles rate limits gracefully
- [ ] Retries failed requests
- [ ] Updates ATLAS_BRAIN.md with confirmed APIs

## Success Metrics

- **API detection rate**: 100% of configured APIs
- **API verification rate**: >95% accuracy
- **Automation success rate**: >90% on first attempt
- **Manual intervention rate**: <10% of API operations

---

**This module closes the #2 gap: Atlas now calls APIs, not just describes calling them.**\n\n---\n\n# Deployment Engine\n\n# Deployment Engine v2.0 - Autonomous Deployment Execution

**The #1 gap in hands-off-gaps.md: Atlas should deploy, not describe deployment.**

## Core Principle

If a deployment platform has a CLI and credentials exist, **Atlas deploys automatically**. No guides, no instructions, no "you should deploy" — Atlas deploys.

## Platform Detection Algorithm

```javascript
FUNCTION detect_deployment_platform():
  platforms = []
  
  // Check for config files
  if exists('vercel.json') OR exists('.vercel/'):
    platforms.push({
      name: 'vercel',
      confidence: 0.95,
      cli: 'vercel',
      deploy_command: 'vercel --prod --yes',
      env_check: 'VERCEL_TOKEN'
    })
  
  if exists('railway.toml') OR exists('railway.json'):
    platforms.push({
      name: 'railway',
      confidence: 0.95,
      cli: 'railway',
      deploy_command: 'railway up',
      env_check: 'RAILWAY_TOKEN'
    })
  
  if exists('fly.toml'):
    platforms.push({
      name: 'fly.io',
      confidence: 0.95,
      cli: 'flyctl',
      deploy_command: 'flyctl deploy --yes',
      env_check: 'FLY_API_TOKEN'
    })
  
  if exists('render.yaml'):
    platforms.push({
      name: 'render',
      confidence: 0.90,
      cli: 'render',
      deploy_command: 'render deploy',
      env_check: 'RENDER_API_KEY'
    })
  
  if exists('Dockerfile'):
    platforms.push({
      name: 'docker',
      confidence: 0.70,
      cli: 'docker',
      deploy_command: 'docker build -t app . && docker run -p 3000:3000 app',
      env_check: null
    })
  
  if exists('.github/workflows/deploy.yml'):
    platforms.push({
      name: 'github-actions',
      confidence: 0.85,
      cli: null,
      deploy_command: 'git push origin main',
      env_check: null
    })
  
  // Check package.json scripts
  pkg = read_json('package.json')
  if pkg.scripts.deploy:
    platforms.push({
      name: 'custom',
      confidence: 0.60,
      cli: 'npm',
      deploy_command: 'npm run deploy',
      env_check: null
    })
  
  return platforms.sort_by_confidence()
```

## Autonomous Deployment Procedure

```text
PROCEDURE autonomous_deploy():

  1. DETECT platforms
     platforms = detect_deployment_platform()
     
     if platforms.length == 0:
       log_warning("No deployment platform detected")
       create_deployment_guide()
       return MANUAL_REQUIRED
     
     primary = platforms[0]
     log_info("Detected platform: {primary.name} (confidence: {primary.confidence})")

  2. CHECK CLI availability
     if primary.cli:
       cli_installed = check_command_exists(primary.cli)
       
       if not cli_installed:
         log_info("Installing {primary.cli}...")
         install_result = install_cli(primary.cli)
         
         if not install_result.success:
           log_error("Failed to install {primary.cli}: {install_result.error}")
           return MANUAL_REQUIRED

  3. CHECK credentials
     if primary.env_check:
       has_creds = check_env_var(primary.env_check)
       
       if not has_creds:
         log_warning("{primary.env_check} not found in environment")
         add_to_userMust({
           id: "um-deploy-001",
           label: "Add {primary.env_check} to environment",
           url: get_platform_auth_url(primary.name),
           estimated_minutes: 5,
           required: true,
           blocks_phase: "2"
         })
         return CREDENTIALS_REQUIRED

  4. PRE-DEPLOY checks
     // Build check
     if has_build_script():
       log_info("Running build...")
       build_result = run_command("npm run build")
       
       if not build_result.success:
         log_error("Build failed: {build_result.error}")
         fix_build_errors(build_result.error)
         build_result = run_command("npm run build")  // Retry once
         
         if not build_result.success:
           return BUILD_FAILED
     
     // Environment variables check
     required_env_vars = detect_required_env_vars()
     missing_vars = check_platform_env_vars(primary.name, required_env_vars)
     
     if missing_vars.length > 0:
       log_info("Adding {missing_vars.length} environment variables to {primary.name}...")
       add_env_vars_to_platform(primary.name, missing_vars)

  5. DEPLOY
     log_info("Deploying to {primary.name}...")
     
     deploy_result = run_command(primary.deploy_command, {
       timeout: 300000,  // 5 minutes
       capture_output: true
     })
     
     if not deploy_result.success:
       log_error("Deployment failed: {deploy_result.error}")
       diagnose_deployment_failure(deploy_result)
       
       // Attempt auto-fix
       fix_applied = auto_fix_deployment_error(deploy_result.error)
       
       if fix_applied:
         log_info("Applied fix, retrying deployment...")
         deploy_result = run_command(primary.deploy_command)
       
       if not deploy_result.success:
         return DEPLOYMENT_FAILED

  6. EXTRACT deployment URL
     url = extract_url_from_output(deploy_result.output, primary.name)
     
     if not url:
       url = get_url_from_platform_api(primary.name)
     
     if not url:
       log_warning("Could not extract deployment URL")
       return URL_UNKNOWN

  7. VERIFY deployment
     log_info("Verifying deployment at {url}...")
     
     // Wait for deployment to be ready
     wait_for_deployment(url, max_wait=120)
     
     // Check HTTP status
     http_status = curl_check(url)
     
     if http_status == 200:
       log_success("✅ Deployment successful: {url} (HTTP {http_status})")
       update_context_json({
         production_url: url,
         deployment_status: "production",
         last_deployed: now()
       })
       return SUCCESS
     
     else:
       log_warning("⚠️ Deployment completed but URL returns HTTP {http_status}")
       check_deployment_logs(primary.name)
       return DEPLOYED_BUT_UNHEALTHY

  8. POST-DEPLOY actions
     // Update ATLAS_BRAIN.md
     append_to_rollback_registry({
       action: "Deploy to {primary.name}",
       timestamp: now(),
       rollback: get_rollback_command(primary.name),
       url: url
     })
     
     // Commit deployment config if changed
     if has_uncommitted_changes():
       git_commit("[Atlas] Deployment configuration")
       git_push()
     
     return SUCCESS
```

## Platform-Specific Implementations

### Vercel

```javascript
FUNCTION deploy_to_vercel():
  // Check for Vercel token
  if not env.VERCEL_TOKEN:
    return {
      success: false,
      error: "VERCEL_TOKEN not found",
      action: "Get token from vercel.com/account/tokens"
    }
  
  // Link project if not linked
  if not exists('.vercel/project.json'):
    log_info("Linking Vercel project...")
    run_command("vercel link --yes")
  
  // Add environment variables
  env_vars = detect_required_env_vars()
  for var in env_vars:
    if not var.is_secret:
      run_command(`vercel env add ${var.name} production`, {
        input: var.value
      })
  
  // Deploy
  result = run_command("vercel --prod --yes")
  
  // Extract URL
  url = extract_from_output(result.output, /https:\/\/[^\s]+\.vercel\.app/)
  
  return {
    success: result.exit_code == 0,
    url: url,
    output: result.output
  }
```

### Railway

```javascript
FUNCTION deploy_to_railway():
  // Check for Railway token
  if not env.RAILWAY_TOKEN:
    return {
      success: false,
      error: "RAILWAY_TOKEN not found",
      action: "Get token from railway.app/account/tokens"
    }
  
  // Initialize if needed
  if not exists('railway.toml') and not exists('railway.json'):
    log_info("Initializing Railway project...")
    run_command("railway init")
  
  // Link project
  if not is_railway_linked():
    run_command("railway link")
  
  // Add environment variables
  env_vars = detect_required_env_vars()
  for var in env_vars:
    run_command(`railway variables set ${var.name}=${var.value}`)
  
  // Deploy
  result = run_command("railway up")
  
  // Get URL from Railway API
  url = get_railway_url_from_api()
  
  return {
    success: result.exit_code == 0,
    url: url,
    output: result.output
  }
```

### Fly.io

```javascript
FUNCTION deploy_to_flyio():
  // Check for Fly token
  if not env.FLY_API_TOKEN:
    return {
      success: false,
      error: "FLY_API_TOKEN not found",
      action: "Get token with: flyctl auth token"
    }
  
  // Create app if doesn't exist
  if not exists('fly.toml'):
    log_info("Creating Fly.io app...")
    app_name = generate_app_name()
    run_command(`flyctl launch --name ${app_name} --yes`)
  
  // Set secrets
  env_vars = detect_required_env_vars()
  secrets = env_vars.filter(v => v.is_secret)
  
  if secrets.length > 0:
    secrets_string = secrets.map(s => `${s.name}=${s.value}`).join(' ')
    run_command(`flyctl secrets set ${secrets_string}`)
  
  // Deploy
  result = run_command("flyctl deploy --yes")
  
  // Get URL
  app_name = extract_app_name_from_fly_toml()
  url = `https://${app_name}.fly.dev`
  
  return {
    success: result.exit_code == 0,
    url: url,
    output: result.output
  }
```

## CLI Installation

```javascript
FUNCTION install_cli(cli_name):
  installers = {
    'vercel': {
      npm: 'npm install -g vercel',
      brew: 'brew install vercel-cli',
      check: 'vercel --version'
    },
    'railway': {
      npm: 'npm install -g @railway/cli',
      brew: 'brew install railway',
      check: 'railway --version'
    },
    'flyctl': {
      npm: null,
      brew: 'brew install flyctl',
      curl: 'curl -L https://fly.io/install.sh | sh',
      check: 'flyctl version'
    },
    'render': {
      npm: 'npm install -g render-cli',
      brew: null,
      check: 'render --version'
    }
  }
  
  installer = installers[cli_name]
  
  // Try npm first (most universal)
  if installer.npm:
    result = run_command(installer.npm)
    if result.exit_code == 0:
      return {success: true, method: 'npm'}
  
  // Try brew on macOS
  if is_macos() and installer.brew:
    result = run_command(installer.brew)
    if result.exit_code == 0:
      return {success: true, method: 'brew'}
  
  // Try curl installer
  if installer.curl:
    result = run_command(installer.curl)
    if result.exit_code == 0:
      return {success: true, method: 'curl'}
  
  return {success: false, error: "No installation method succeeded"}
```

## Environment Variable Management

```javascript
FUNCTION detect_required_env_vars():
  env_vars = []
  
  // Scan source files for process.env references
  source_files = find_files(['**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx'])
  
  for file in source_files:
    content = read_file(file)
    matches = content.match_all(/process\.env\.([A-Z_]+)/g)
    
    for match in matches:
      var_name = match[1]
      
      // Check if value exists in .env
      value = read_env_var(var_name)
      
      // Determine if it's a secret
      is_secret = is_secret_var_name(var_name)
      
      env_vars.push({
        name: var_name,
        value: value,
        is_secret: is_secret,
        found_in: file
      })
  
  // Deduplicate
  return unique_by(env_vars, 'name')

FUNCTION is_secret_var_name(name):
  secret_patterns = [
    '_SECRET', '_KEY', '_TOKEN', '_PASSWORD',
    '_PRIVATE', '_API_KEY', '_CLIENT_SECRET'
  ]
  
  return secret_patterns.some(pattern => name.includes(pattern))

FUNCTION add_env_vars_to_platform(platform, env_vars):
  switch platform:
    case 'vercel':
      for var in env_vars:
        if not var.is_secret and var.value:
          run_command(`vercel env add ${var.name} production`, {
            input: var.value
          })
    
    case 'railway':
      for var in env_vars:
        if var.value:
          run_command(`railway variables set ${var.name}=${var.value}`)
    
    case 'fly.io':
      secrets = env_vars.filter(v => v.is_secret and v.value)
      if secrets.length > 0:
        secrets_string = secrets.map(s => `${s.name}=${s.value}`).join(' ')
        run_command(`flyctl secrets set ${secrets_string}`)
```

## Deployment Error Diagnosis & Auto-Fix

```javascript
FUNCTION diagnose_deployment_failure(deploy_result):
  error = deploy_result.error
  output = deploy_result.output
  
  // Common error patterns
  patterns = [
    {
      pattern: /Missing required env var/i,
      diagnosis: "Missing environment variable",
      fix: "add_missing_env_vars"
    },
    {
      pattern: /Build failed.*cannot find module/i,
      diagnosis: "Missing dependency",
      fix: "install_dependencies"
    },
    {
      pattern: /Authentication required/i,
      diagnosis: "Missing or invalid credentials",
      fix: "check_credentials"
    },
    {
      pattern: /Port.*already in use/i,
      diagnosis: "Port conflict",
      fix: "change_port"
    },
    {
      pattern: /Out of memory/i,
      diagnosis: "Insufficient memory",
      fix: "increase_memory_limit"
    },
    {
      pattern: /Timeout/i,
      diagnosis: "Deployment timeout",
      fix: "increase_timeout"
    }
  ]
  
  for pattern_def in patterns:
    if pattern_def.pattern.test(output):
      return {
        diagnosis: pattern_def.diagnosis,
        fix_function: pattern_def.fix,
        error_snippet: extract_error_snippet(output)
      }
  
  return {
    diagnosis: "Unknown deployment error",
    fix_function: null,
    error_snippet: output.slice(-500)  // Last 500 chars
  }

FUNCTION auto_fix_deployment_error(error):
  diagnosis = diagnose_deployment_failure({error: error, output: error})
  
  switch diagnosis.fix_function:
    case "add_missing_env_vars":
      missing_vars = extract_missing_vars(error)
      for var in missing_vars:
        value = read_env_var(var)
        if value:
          add_env_var_to_platform(current_platform, var, value)
      return true
    
    case "install_dependencies":
      run_command("npm install")
      return true
    
    case "check_credentials":
      // Can't auto-fix, add to userMust
      return false
    
    case "change_port":
      update_port_config()
      return true
    
    case "increase_memory_limit":
      update_memory_config()
      return true
    
    default:
      return false
```

## Rollback Capabilities

```javascript
FUNCTION get_rollback_command(platform):
  rollback_commands = {
    'vercel': 'vercel rollback',
    'railway': 'railway rollback',
    'fly.io': 'flyctl releases rollback',
    'render': 'render rollback',
    'github-actions': 'git revert HEAD && git push'
  }
  
  return rollback_commands[platform] || 'git revert HEAD'

FUNCTION execute_rollback(platform):
  log_info("Rolling back deployment on {platform}...")
  
  rollback_cmd = get_rollback_command(platform)
  result = run_command(rollback_cmd)
  
  if result.exit_code == 0:
    log_success("✅ Rollback successful")
    return true
  else:
    log_error("❌ Rollback failed: {result.error}")
    return false
```

## Health Check & Verification

```javascript
FUNCTION wait_for_deployment(url, max_wait=120):
  start_time = now()
  
  while (now() - start_time) < max_wait:
    try:
      response = http_get(url, timeout=5)
      
      if response.status_code in [200, 301, 302]:
        return true
      
      log_info("Waiting for deployment... (HTTP {response.status_code})")
    catch error:
      log_info("Waiting for deployment... (not ready yet)")
    
    sleep(5)
  
  return false

FUNCTION curl_check(url):
  result = run_command(`curl -sS -o /dev/null -w "%{http_code}" ${url}`)
  return parseInt(result.output)

FUNCTION check_deployment_logs(platform):
  log_commands = {
    'vercel': 'vercel logs',
    'railway': 'railway logs',
    'fly.io': 'flyctl logs',
    'render': 'render logs'
  }
  
  cmd = log_commands[platform]
  if cmd:
    result = run_command(cmd)
    log_info("Recent logs:\n{result.output.slice(-1000)}")
```

## Integration with Code Sprint

```text
// In code-sprint.md, Step 8 becomes:

STEP 8: AUTONOMOUS DEPLOYMENT

Load deployment-engine.md
result = autonomous_deploy()

switch result:
  case SUCCESS:
    log_success("✅ Deployed to production: {result.url}")
    update_sovereign_score(+5)  // Deployment adds 5 points
  
  case CREDENTIALS_REQUIRED:
    log_warning("⚠️ Deployment requires credentials")
    // userMust already added by deployment engine
    continue_pipeline()  // Don't block
  
  case BUILD_FAILED:
    log_error("❌ Build failed, fixing...")
    fix_build_errors()
    retry_deployment()
  
  case DEPLOYMENT_FAILED:
    log_error("❌ Deployment failed")
    create_deployment_guide()  // Fallback to manual
    add_to_userMust({
      id: "um-deploy-manual",
      label: "Deploy manually using guide",
      estimated_minutes: 15
    })
  
  case MANUAL_REQUIRED:
    log_info("ℹ️ Manual deployment required")
    create_deployment_guide()
```

## Acceptance Criteria

- [ ] Detects deployment platform with >90% accuracy
- [ ] Installs CLI tools automatically when missing
- [ ] Adds environment variables to platform automatically
- [ ] Deploys successfully on first attempt for standard configs
- [ ] Retries deployment once after auto-fixing common errors
- [ ] Verifies deployment with HTTP check
- [ ] Updates ATLAS_BRAIN.md with rollback command
- [ ] Never blocks pipeline on deployment failure
- [ ] Provides clear userMust items when manual action needed
- [ ] Supports Vercel, Railway, Fly.io, Render, and GitHub Actions

## Success Metrics

- **Deployment success rate**: >85% on first attempt
- **Auto-fix success rate**: >60% of failures fixed automatically
- **Time to deploy**: <5 minutes for standard apps
- **Manual intervention rate**: <15% of deployments

---

**This module closes the #1 gap: Atlas now deploys, not just describes deployment.**\n\n---\n\n# Credential Acquisition\n\n# Atlas Credential Acquisition

**Input:** Missing env vars from `.env.example`, runtime checks, or provider integrations.
**Purpose:** Turn "get an API key" into a browser-assisted Atlas action.

## Rule

Atlas does not stop at "go get this key." It opens the provider page in a visible browser, lets the founder sign in, resumes control, captures the key where the page exposes it, stores it locally, updates `credentials_index.json`, and continues.

Secrets are never printed in full. `credentials_index.json` records existence, provider, storage location, and verification status, not secret values.

## Command

```bash
node scripts/atlas/cli.js credentials setup <project-slug> --providers core
```

Provider set:

```text
core = stripe,resend,sentry,betteruptime
all  = stripe,resend,sentry,betteruptime,posthog
```

Options:

```bash
--providers stripe,resend
--env-file C:\path\to\.env.local
--scope local   # writes local env file and marks current process env
--scope user    # also writes persistent user env where supported
```

## Browser Protocol

1. Launch Chromium headed (`headless: false`) with slow motion for visibility.
2. Navigate to the provider credential page.
3. Pause while the founder signs in, completes MFA, and creates/reveals the key.
4. Resume after the founder presses Enter in the terminal.
5. Attempt DOM extraction using provider-specific selectors and key patterns.
6. If extraction fails, prompt with a hidden password input.
7. Save to env storage and update `credentials_index.json`.
8. Move to the next provider automatically.

## Default Providers

| Provider | URL | Env vars |
|---|---|---|
| Stripe | `https://dashboard.stripe.com/apikeys` | `STRIPE_SECRET_KEY` |
| Resend | `https://resend.com/api-keys` | `RESEND_API_KEY` |
| Sentry | `https://sentry.io/settings/` | `SENTRY_AUTH_TOKEN`, `SENTRY_DSN` |
| Better Uptime | `https://uptime.betterstack.com/team/api-tokens` | `BETTER_UPTIME_API_KEY` |
| PostHog | `https://app.posthog.com/project/settings` | `POSTHOG_API_KEY`, `POSTHOG_PROJECT_ID` |

## Security Rules

- Do not commit `.env`, `.env.local`, or `~/.atlas/portfolio/*/.env`.
- Do not write raw secret values to logs, reports, markdown docs, screenshots, or `credentials_index.json`.
- Do not bypass MFA, captchas, identity checks, payment consent, or security prompts.
- If a provider shows a key only once, capture it immediately or fall back to hidden prompt.
- If the provider requires paid plan selection, destructive permission, or organization-wide access, pause with a `userMust`.

## Acceptance Test

- [ ] Missing provider env vars can be listed with `atlas credentials providers`.
- [ ] `atlas credentials setup <project>` opens a headed browser for each provider.
- [ ] Captured values are written to the selected env file.
- [ ] `credentials_index.json` records each captured key without storing the value.
- [ ] CLI output masks secret values.\n\n