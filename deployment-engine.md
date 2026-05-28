---
name: atlas-deployment-engine
description: Autonomous deployment engine that actually deploys, not just describes deployment. Handles Vercel, Railway, Fly.io, Render, AWS, Azure, and custom Docker deployments with automatic platform detection, credential management, and rollback capabilities.
---

# Deployment Engine v2.0 - Autonomous Deployment Execution

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

**This module closes the #1 gap: Atlas now deploys, not just describes deployment.**