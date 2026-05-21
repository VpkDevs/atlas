---
name: atlas-api-execution-engine
description: Autonomous API execution engine that actually calls APIs, not just describes them. If a tool has an API and its key exists in .env, Atlas uses that API directly. Covers Stripe, Resend, SendGrid, Buffer, Better Uptime, PostHog, Sentry, Linear, Slack, Discord, and 40+ more platforms.
---

# API Execution Engine v2.0 - Direct API Integration

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

**This module closes the #2 gap: Atlas now calls APIs, not just describes calling them.**