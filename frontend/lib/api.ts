import {
  Failure,
  FailureCategory,
  AnalyticsAccuracy,
  TrendPoint,
  PromptVersion,
  IntrospectionResult,
  ImprovePromptResponse,
  DiffLine,
  OutcomeResult,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_FAILURES: Failure[] = [
  {
    id: 'fail-001',
    repository: 'acme/auth-service',
    branch: 'main',
    commit_sha: 'a1b2c3d4e5f6',
    category: 'FLAKY_TEST',
    confidence: 82,
    severity: 'MEDIUM',
    status: 'DIAGNOSED',
    root_cause:
      'Intermittent login failure caused by race condition in session initialization. Test passes ~80% of the time but fails when auth token refresh overlaps with session creation.',
    affected_files: ['tests/auth/test_login.py', 'src/auth/session.py'],
    recommended_fix:
      'Add retry logic with exponential backoff (max 3 retries, 100ms initial delay) and ensure session lock is acquired before token refresh.',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    prompt_version: 'V2',
    prompt_used:
      'You are an expert CI/CD failure analyst. Analyze the following build log and classify the failure into one of these categories: INFRASTRUCTURE_FAILURE, DEPENDENCY_FAILURE, TEST_FAILURE, FLAKY_TEST, BUILD_ERROR, DEPLOYMENT_ERROR, SECURITY_FAILURE, CONFIGURATION_ISSUE.\n\nProvide:\n1. Category classification\n2. Confidence score (0-100)\n3. Root cause analysis\n4. Affected files\n5. Recommended fix',
    agent_response:
      'Based on my analysis of the build log, this is a FLAKY_TEST failure.\n\n**Root Cause:** The test `test_login_flow` in `tests/auth/test_login.py` exhibits intermittent failures. The failure pattern shows a race condition where `session.refresh_token()` is called concurrently with `session.create()`, causing an `InvalidSessionState` exception approximately 20% of the time.\n\n**Evidence:**\n- The test has failed 4 times in the last 20 runs with identical stack traces\n- No code changes were made between passing and failing runs\n- The error consistently occurs at line 47 of `session.py`\n\n**Recommended Fix:** Implement a session mutex lock and add retry logic with exponential backoff.',
    tool_calls: [
      {
        name: 'search_build_logs',
        input: { query: 'test_login_flow failure', limit: 10 },
        output: 'Found 4 failures in last 20 runs. Stack trace: InvalidSessionState at session.py:47',
      },
      {
        name: 'analyze_test_history',
        input: { test_name: 'test_login_flow', days: 7 },
        output: 'Pass rate: 80%. Failure pattern: non-deterministic. No correlated code changes.',
      },
      {
        name: 'check_code_changes',
        input: { commit: 'a1b2c3d4e5f6', files: ['tests/auth/test_login.py'] },
        output: 'No changes to test file in last 5 commits. Last modified 12 days ago.',
      },
    ],
    latency_ms: 1247,
    token_usage: { input: 2103, output: 744, total: 2847 },
    phoenix_trace_url: 'https://phoenix.example.com/traces/abc123',
  },
  {
    id: 'fail-002',
    repository: 'acme/payment-api',
    branch: 'feature/stripe-v3',
    commit_sha: 'b2c3d4e5f6a7',
    category: 'BUILD_ERROR',
    confidence: 95,
    severity: 'HIGH',
    status: 'OUTCOME_RECORDED',
    root_cause:
      'TypeScript compilation error due to incompatible type definition in Stripe SDK v3 migration. The `PaymentIntent.status` property changed from string union to enum.',
    affected_files: ['src/payments/stripe.ts', 'src/types/payment.d.ts'],
    recommended_fix:
      'Update type definitions to use `Stripe.PaymentIntent.Status` enum instead of string literals. Run `npm run generate-types` to regenerate SDK types.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    prompt_version: 'V2',
    latency_ms: 892,
    token_usage: { input: 1856, output: 623, total: 2479 },
  },
  {
    id: 'fail-003',
    repository: 'acme/infra-terraform',
    branch: 'main',
    commit_sha: 'c3d4e5f6a7b8',
    category: 'INFRASTRUCTURE_FAILURE',
    confidence: 88,
    severity: 'CRITICAL',
    status: 'DIAGNOSED',
    root_cause:
      'AWS ECS task failed to start due to insufficient memory allocation. Container requested 2GB but task definition only allows 1GB. Recent code change increased memory footprint.',
    affected_files: ['terraform/ecs/task-def.tf', 'docker/Dockerfile.production'],
    recommended_fix:
      'Increase ECS task memory to 2048MB in terraform/ecs/task-def.tf and run `terraform apply`. Consider adding memory monitoring alerts.',
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    prompt_version: 'V2',
    latency_ms: 1534,
    token_usage: { input: 2891, output: 856, total: 3747 },
  },
  {
    id: 'fail-004',
    repository: 'acme/frontend-app',
    branch: 'develop',
    commit_sha: 'd4e5f6a7b8c9',
    category: 'DEPENDENCY_FAILURE',
    confidence: 76,
    severity: 'MEDIUM',
    status: 'PENDING',
    root_cause:
      'NPM install failed due to conflicting peer dependency between react@18.2 and react-beautiful-dnd@13.1 which requires react@^16.8 || ^17.0.',
    affected_files: ['package.json', 'package-lock.json'],
    recommended_fix:
      'Replace react-beautiful-dnd with @hello-pangea/dnd (maintained fork with React 18 support) or add --legacy-peer-deps flag to CI install step.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    prompt_version: 'V2',
    latency_ms: 756,
    token_usage: { input: 1432, output: 498, total: 1930 },
  },
  {
    id: 'fail-005',
    repository: 'acme/api-gateway',
    branch: 'release/2.4',
    commit_sha: 'e5f6a7b8c9d0',
    category: 'DEPLOYMENT_ERROR',
    confidence: 91,
    severity: 'HIGH',
    status: 'DIAGNOSED',
    root_cause:
      'Kubernetes rolling deployment failed health check. New pods returned 503 on /health endpoint because database migration hadn\'t completed before deployment started.',
    affected_files: ['k8s/deployment.yaml', 'scripts/migrate.sh', 'src/health.ts'],
    recommended_fix:
      'Add init container for database migration in deployment.yaml. Set readiness probe initialDelaySeconds to 30s to allow migration time.',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    prompt_version: 'V2',
    latency_ms: 1123,
    token_usage: { input: 2234, output: 712, total: 2946 },
  },
  {
    id: 'fail-006',
    repository: 'acme/auth-service',
    branch: 'main',
    commit_sha: 'f6a7b8c9d0e1',
    category: 'TEST_FAILURE',
    confidence: 94,
    severity: 'MEDIUM',
    status: 'OUTCOME_RECORDED',
    root_cause:
      'Unit test assertion failed: expected JWT expiration to be 3600s but got 7200s. The default token TTL was changed in a recent config update without updating the test.',
    affected_files: ['tests/unit/test_jwt.py', 'config/auth.yaml'],
    recommended_fix:
      'Update test assertion to expect 7200s or read expected value from config. Add config validation test to prevent similar drift.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    prompt_version: 'V2',
    latency_ms: 634,
    token_usage: { input: 1245, output: 389, total: 1634 },
  },
  {
    id: 'fail-007',
    repository: 'acme/ml-pipeline',
    branch: 'feat/model-v3',
    commit_sha: 'a7b8c9d0e1f2',
    category: 'CONFIGURATION_ISSUE',
    confidence: 67,
    severity: 'LOW',
    status: 'PENDING',
    root_cause:
      'Model training pipeline failed because GPU instance type g4dn.xlarge was not available in us-east-1a. The availability zone is hardcoded in pipeline config.',
    affected_files: ['pipeline/config.yaml', 'pipeline/train.py'],
    recommended_fix:
      'Use availability zone auto-selection or add fallback AZs in pipeline config. Consider using spot instance fleet with multiple AZ options.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    prompt_version: 'V1',
    latency_ms: 1876,
    token_usage: { input: 3102, output: 934, total: 4036 },
  },
  {
    id: 'fail-008',
    repository: 'acme/security-scanner',
    branch: 'main',
    commit_sha: 'b8c9d0e1f2a3',
    category: 'SECURITY_FAILURE',
    confidence: 97,
    severity: 'CRITICAL',
    status: 'DIAGNOSED',
    root_cause:
      'Trivy scan detected critical CVE-2024-3094 in xz-utils 5.6.0 (backdoor vulnerability). Container base image alpine:3.19 includes affected version.',
    affected_files: ['docker/Dockerfile', 'docker/Dockerfile.ci'],
    recommended_fix:
      'Update base image to alpine:3.19.1 which patches xz-utils. Pin all base images to digest hashes. Add Trivy scan to PR checks.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    prompt_version: 'V2',
    latency_ms: 445,
    token_usage: { input: 987, output: 312, total: 1299 },
  },
  {
    id: 'fail-009',
    repository: 'acme/data-service',
    branch: 'hotfix/db-pool',
    commit_sha: 'c9d0e1f2a3b4',
    category: 'INFRASTRUCTURE_FAILURE',
    confidence: 73,
    severity: 'HIGH',
    status: 'PENDING',
    root_cause:
      'Integration tests timed out due to PostgreSQL connection pool exhaustion. CI environment has max 10 connections but tests spawn 15 parallel workers.',
    affected_files: ['tests/conftest.py', 'docker-compose.ci.yml', 'src/db/pool.py'],
    recommended_fix:
      'Reduce parallel test workers to 8 in CI config or increase PostgreSQL max_connections to 20 in docker-compose.ci.yml. Add connection pool monitoring.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    prompt_version: 'V2',
    latency_ms: 2134,
    token_usage: { input: 3456, output: 1023, total: 4479 },
  },
  {
    id: 'fail-010',
    repository: 'acme/mobile-bff',
    branch: 'develop',
    commit_sha: 'd0e1f2a3b4c5',
    category: 'FLAKY_TEST',
    confidence: 58,
    severity: 'LOW',
    status: 'DIAGNOSED',
    root_cause:
      'E2E test "should display user profile" fails intermittently due to network timeout when fetching user avatar from CDN. CDN response time varies 50ms-3000ms.',
    affected_files: ['tests/e2e/profile.spec.ts', 'src/components/Avatar.tsx'],
    recommended_fix:
      'Mock CDN responses in E2E tests or increase timeout to 5000ms. Add loading skeleton to Avatar component for better UX during slow CDN responses.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    prompt_version: 'V2',
    latency_ms: 1567,
    token_usage: { input: 2678, output: 823, total: 3501 },
  },
  {
    id: 'fail-011',
    repository: 'acme/notification-svc',
    branch: 'feat/push-v2',
    commit_sha: 'e1f2a3b4c5d6',
    category: 'BUILD_ERROR',
    confidence: 89,
    severity: 'MEDIUM',
    status: 'PENDING',
    root_cause:
      'Gradle build failed with OutOfMemoryError during compilation. The new push notification module adds 50+ dependencies, exceeding default 512MB heap.',
    affected_files: ['build.gradle.kts', 'gradle.properties', 'push-module/build.gradle.kts'],
    recommended_fix:
      'Increase Gradle JVM heap in gradle.properties: `org.gradle.jvmargs=-Xmx2g`. Consider modularizing dependencies to reduce compilation memory.',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    prompt_version: 'V2',
    latency_ms: 978,
    token_usage: { input: 1876, output: 567, total: 2443 },
  },
  {
    id: 'fail-012',
    repository: 'acme/order-service',
    branch: 'main',
    commit_sha: 'f2a3b4c5d6e7',
    category: 'DEPENDENCY_FAILURE',
    confidence: 84,
    severity: 'HIGH',
    status: 'OUTCOME_RECORDED',
    root_cause:
      'PyPI package `requests==2.31.0` download failed with 503 during pip install. PyPI experienced a 15-minute outage affecting CI pipelines globally.',
    affected_files: ['requirements.txt', 'Dockerfile', '.github/workflows/ci.yml'],
    recommended_fix:
      'Add PyPI mirror as fallback in pip config. Cache pip dependencies in CI. Consider using a private artifact repository (Artifactory/Nexus) for critical dependencies.',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    prompt_version: 'V1',
    latency_ms: 1345,
    token_usage: { input: 2123, output: 678, total: 2801 },
  },
];

const MOCK_ACCURACY: AnalyticsAccuracy = {
  overall_accuracy: 78,
  total_diagnoses: 200,
  correct_diagnoses: 156,
  incorrect_diagnoses: 44,
  accuracy_by_category: [
    { category: 'BUILD_ERROR', accuracy: 92, count: 35 },
    { category: 'TEST_FAILURE', accuracy: 85, count: 42 },
    { category: 'DEPLOYMENT_ERROR', accuracy: 79, count: 28 },
    { category: 'INFRASTRUCTURE_FAILURE', accuracy: 76, count: 31 },
    { category: 'DEPENDENCY_FAILURE', accuracy: 74, count: 22 },
    { category: 'SECURITY_FAILURE', accuracy: 71, count: 9 },
    { category: 'CONFIGURATION_ISSUE', accuracy: 68, count: 18 },
    { category: 'FLAKY_TEST', accuracy: 55, count: 15 },
  ],
  weak_spots: [
    { category: 'FLAKY_TEST', accuracy: 55 },
    { category: 'CONFIGURATION_ISSUE', accuracy: 68 },
  ],
};

const MOCK_TRENDS: TrendPoint[] = (() => {
  const points: TrendPoint[] = [];
  const now = Date.now();
  let accuracy = 64;
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    accuracy += Math.random() * 1.2 - 0.3;
    accuracy = Math.min(Math.max(accuracy, 60), 82);
    if (i < 5) accuracy = Math.min(accuracy + 0.5, 78);
    points.push({
      date: date.toISOString().split('T')[0],
      accuracy: Math.round(accuracy * 10) / 10,
    });
  }
  points[points.length - 1].accuracy = 78;
  return points;
})();

const MOCK_PROMPTS: PromptVersion[] = [
  {
    version: 'V1',
    content: `You are a CI/CD failure analyst. When given a build log, identify:
1. The type of failure (one of: INFRASTRUCTURE_FAILURE, DEPENDENCY_FAILURE, TEST_FAILURE, FLAKY_TEST, BUILD_ERROR, DEPLOYMENT_ERROR, SECURITY_FAILURE, CONFIGURATION_ISSUE)
2. The root cause
3. Affected files
4. A recommended fix

Be concise and accurate. If you're unsure between TEST_FAILURE and FLAKY_TEST, default to TEST_FAILURE. For infrastructure issues, focus on resource constraints and network problems.`,
    accuracy: 72,
    diagnosis_count: 31,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: false,
    status: 'ARCHIVED',
  },
  {
    version: 'V2',
    content: `You are an expert CI/CD failure analyst with deep knowledge of DevOps, cloud infrastructure, and software testing patterns.

TASK: Analyze the provided build/CI log and produce a structured diagnosis.

CLASSIFICATION CATEGORIES:
- INFRASTRUCTURE_FAILURE: Cloud resource issues, network failures, service outages
- DEPENDENCY_FAILURE: Package resolution, version conflicts, registry outages
- TEST_FAILURE: Deterministic test failures due to code bugs or assertion errors
- FLAKY_TEST: Non-deterministic test failures (timing, race conditions, external deps)
- BUILD_ERROR: Compilation errors, type errors, build tool failures
- DEPLOYMENT_ERROR: Deploy pipeline failures, health check failures, rollback triggers
- SECURITY_FAILURE: Vulnerability scans, secret exposure, compliance violations
- CONFIGURATION_ISSUE: Misconfigurations in CI, cloud, or application settings

OUTPUT FORMAT:
1. Category (from list above)
2. Confidence (0-100)
3. Severity (LOW/MEDIUM/HIGH/CRITICAL)
4. Root cause (detailed technical explanation)
5. Affected files (list of file paths)
6. Recommended fix (actionable steps)

GUIDELINES:
- Always provide specific file paths when available
- Include evidence from the log to support classification
- For confidence below 70%, explain uncertainty factors`,
    accuracy: 81,
    diagnosis_count: 16,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    status: 'ACTIVE',
  },
  {
    version: 'V3',
    content: `You are an expert CI/CD failure analyst with deep knowledge of DevOps, cloud infrastructure, and software testing patterns.

TASK: Analyze the provided build/CI log and produce a structured diagnosis.

CLASSIFICATION CATEGORIES:
- INFRASTRUCTURE_FAILURE: Cloud resource issues (CPU/memory/disk), network failures, service outages, DNS resolution failures. NOT configuration mistakes.
- DEPENDENCY_FAILURE: Package resolution, version conflicts, registry outages, incompatible peer dependencies
- TEST_FAILURE: Deterministic test failures due to code bugs, assertion errors, or outdated test expectations. Must be reproducible.
- FLAKY_TEST: Non-deterministic failures showing: inconsistent pass/fail without code changes, timing-sensitive operations, race conditions, external service dependencies, network-dependent assertions. Key signal: same test passes on retry.
- BUILD_ERROR: Compilation errors, type errors, build tool OOM, syntax errors
- DEPLOYMENT_ERROR: Deploy pipeline failures, health check failures, rollback triggers, migration ordering issues
- SECURITY_FAILURE: CVE detections, vulnerability scans, secret exposure, compliance violations
- CONFIGURATION_ISSUE: Wrong environment variables, misconfigured YAML/TOML, incorrect resource limits in config files. Distinguished from INFRASTRUCTURE by: config is a human mistake in settings, infrastructure is a resource/service availability issue.

FLAKY TEST DETECTION HEURISTICS:
- Check if the test has passed and failed on the same commit
- Look for timing-related keywords: timeout, race, intermittent, sporadic
- Check for network/external service calls in test code
- Retry patterns in logs indicate FLAKY_TEST, not TEST_FAILURE
- Random seed or ordering dependencies suggest flakiness

CONFIGURATION vs INFRASTRUCTURE DISTINCTION:
- If a resource is unavailable due to wrong region/AZ in config → CONFIGURATION_ISSUE
- If a resource is unavailable due to cloud provider outage → INFRASTRUCTURE_FAILURE
- If settings file has wrong values → CONFIGURATION_ISSUE
- If correctly configured service is unreachable → INFRASTRUCTURE_FAILURE

OUTPUT FORMAT:
1. Category (from list above)
2. Confidence (0-100)
3. Severity (LOW/MEDIUM/HIGH/CRITICAL)
4. Root cause (detailed technical explanation with evidence)
5. Affected files (list of file paths)
6. Recommended fix (actionable steps with code examples when possible)

GUIDELINES:
- Always provide specific file paths when available
- Include evidence from the log to support classification
- For confidence below 70%, explain uncertainty factors
- Cross-reference test history when available for flakiness detection
- Consider the broader context: recent deployments, infrastructure changes, dependency updates`,
    accuracy: 86,
    diagnosis_count: 0,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: false,
    status: 'PROPOSED',
  },
];

const MOCK_DIFF: DiffLine[] = [
  { type: 'unchanged', content: 'You are an expert CI/CD failure analyst with deep knowledge of DevOps, cloud infrastructure, and software testing patterns.' },
  { type: 'unchanged', content: '' },
  { type: 'unchanged', content: 'TASK: Analyze the provided build/CI log and produce a structured diagnosis.' },
  { type: 'unchanged', content: '' },
  { type: 'unchanged', content: 'CLASSIFICATION CATEGORIES:' },
  { type: 'removed', content: '- INFRASTRUCTURE_FAILURE: Cloud resource issues, network failures, service outages' },
  { type: 'added', content: '- INFRASTRUCTURE_FAILURE: Cloud resource issues (CPU/memory/disk), network failures, service outages, DNS resolution failures. NOT configuration mistakes.' },
  { type: 'unchanged', content: '- DEPENDENCY_FAILURE: Package resolution, version conflicts, registry outages' },
  { type: 'removed', content: '- TEST_FAILURE: Deterministic test failures due to code bugs or assertion errors' },
  { type: 'added', content: '- TEST_FAILURE: Deterministic test failures due to code bugs, assertion errors, or outdated test expectations. Must be reproducible.' },
  { type: 'removed', content: '- FLAKY_TEST: Non-deterministic test failures (timing, race conditions, external deps)' },
  { type: 'added', content: '- FLAKY_TEST: Non-deterministic failures showing: inconsistent pass/fail without code changes, timing-sensitive operations, race conditions, external service dependencies, network-dependent assertions. Key signal: same test passes on retry.' },
  { type: 'unchanged', content: '- BUILD_ERROR: Compilation errors, type errors, build tool failures' },
  { type: 'unchanged', content: '- DEPLOYMENT_ERROR: Deploy pipeline failures, health check failures, rollback triggers' },
  { type: 'unchanged', content: '- SECURITY_FAILURE: Vulnerability scans, secret exposure, compliance violations' },
  { type: 'removed', content: '- CONFIGURATION_ISSUE: Misconfigurations in CI, cloud, or application settings' },
  { type: 'added', content: '- CONFIGURATION_ISSUE: Wrong environment variables, misconfigured YAML/TOML, incorrect resource limits in config files. Distinguished from INFRASTRUCTURE by: config is a human mistake in settings, infrastructure is a resource/service availability issue.' },
  { type: 'unchanged', content: '' },
  { type: 'added', content: 'FLAKY TEST DETECTION HEURISTICS:' },
  { type: 'added', content: '- Check if the test has passed and failed on the same commit' },
  { type: 'added', content: '- Look for timing-related keywords: timeout, race, intermittent, sporadic' },
  { type: 'added', content: '- Check for network/external service calls in test code' },
  { type: 'added', content: '- Retry patterns in logs indicate FLAKY_TEST, not TEST_FAILURE' },
  { type: 'added', content: '- Random seed or ordering dependencies suggest flakiness' },
  { type: 'added', content: '' },
  { type: 'added', content: 'CONFIGURATION vs INFRASTRUCTURE DISTINCTION:' },
  { type: 'added', content: '- If a resource is unavailable due to wrong region/AZ in config → CONFIGURATION_ISSUE' },
  { type: 'added', content: '- If a resource is unavailable due to cloud provider outage → INFRASTRUCTURE_FAILURE' },
  { type: 'added', content: '- If settings file has wrong values → CONFIGURATION_ISSUE' },
  { type: 'added', content: '- If correctly configured service is unreachable → INFRASTRUCTURE_FAILURE' },
  { type: 'unchanged', content: '' },
  { type: 'unchanged', content: 'OUTPUT FORMAT:' },
  { type: 'unchanged', content: '1. Category (from list above)' },
  { type: 'unchanged', content: '2. Confidence (0-100)' },
  { type: 'unchanged', content: '3. Severity (LOW/MEDIUM/HIGH/CRITICAL)' },
  { type: 'removed', content: '4. Root cause (detailed technical explanation)' },
  { type: 'added', content: '4. Root cause (detailed technical explanation with evidence)' },
  { type: 'unchanged', content: '5. Affected files (list of file paths)' },
  { type: 'removed', content: '6. Recommended fix (actionable steps)' },
  { type: 'added', content: '6. Recommended fix (actionable steps with code examples when possible)' },
  { type: 'unchanged', content: '' },
  { type: 'unchanged', content: 'GUIDELINES:' },
  { type: 'unchanged', content: '- Always provide specific file paths when available' },
  { type: 'unchanged', content: '- Include evidence from the log to support classification' },
  { type: 'unchanged', content: '- For confidence below 70%, explain uncertainty factors' },
  { type: 'added', content: '- Cross-reference test history when available for flakiness detection' },
  { type: 'added', content: '- Consider the broader context: recent deployments, infrastructure changes, dependency updates' },
];

const MOCK_INTROSPECTION: IntrospectionResult = {
  weak_categories: ['FLAKY_TEST', 'CONFIGURATION_ISSUE'],
  misclassification_patterns: [
    { from: 'FLAKY_TEST', to: 'TEST_FAILURE', count: 12 },
    { from: 'CONFIGURATION_ISSUE', to: 'INFRASTRUCTURE_FAILURE', count: 7 },
    { from: 'DEPENDENCY_FAILURE', to: 'BUILD_ERROR', count: 4 },
    { from: 'INFRASTRUCTURE_FAILURE', to: 'DEPLOYMENT_ERROR', count: 3 },
  ],
  suggested_improvements: [
    'Add specific heuristics for detecting flaky tests: check for retry patterns, timing-related keywords, and inconsistent pass/fail rates on the same commit.',
    'Distinguish configuration issues from infrastructure failures by checking if the problem is a misconfigured setting vs. a resource availability issue.',
    'Include examples of network intermittency patterns that indicate FLAKY_TEST rather than INFRASTRUCTURE_FAILURE.',
    'Add detection for dependency resolution failures that manifest as build errors (e.g., missing types from unresolved packages).',
    'Improve severity classification: CVEs should always be CRITICAL, flaky tests should default to LOW unless they block deployments.',
  ],
};

// ─── API Functions ──────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } catch {
    throw new Error(`Failed to fetch ${path}`);
  }
}

// ─── Failures ───────────────────────────────────────────────────────────────

export async function getFailures(): Promise<Failure[]> {
  try {
    return await apiFetch<Failure[]>('/failures');
  } catch {
    return MOCK_FAILURES;
  }
}

export async function getFailure(id: string): Promise<Failure> {
  try {
    return await apiFetch<Failure>(`/failures/${id}`);
  } catch {
    const found = MOCK_FAILURES.find((f) => f.id === id);
    if (found) return found;
    return MOCK_FAILURES[0];
  }
}

// ─── Outcomes ───────────────────────────────────────────────────────────────

export async function submitOutcome(
  id: string,
  outcome: { result: OutcomeResult; actual_category?: FailureCategory; notes?: string }
): Promise<void> {
  try {
    await apiFetch(`/outcome/${id}`, {
      method: 'POST',
      body: JSON.stringify(outcome),
    });
  } catch {
    // Mock: simulate success
    console.log('Mock outcome submitted:', id, outcome);
  }
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export async function getAccuracy(): Promise<AnalyticsAccuracy> {
  try {
    return await apiFetch<AnalyticsAccuracy>('/analytics/accuracy');
  } catch {
    return MOCK_ACCURACY;
  }
}

export async function getTrends(): Promise<TrendPoint[]> {
  try {
    return await apiFetch<TrendPoint[]>('/analytics/trends');
  } catch {
    return MOCK_TRENDS;
  }
}

export async function runEvaluation(): Promise<{ message: string }> {
  try {
    return await apiFetch<{ message: string }>('/analytics/run-eval', { method: 'POST' });
  } catch {
    await new Promise((r) => setTimeout(r, 2000));
    return { message: 'Evaluation complete. 200 diagnoses evaluated.' };
  }
}

// ─── Prompts ────────────────────────────────────────────────────────────────

export async function getPrompts(): Promise<PromptVersion[]> {
  try {
    return await apiFetch<PromptVersion[]>('/prompts');
  } catch {
    return MOCK_PROMPTS;
  }
}

export async function getActivePrompt(): Promise<PromptVersion> {
  try {
    return await apiFetch<PromptVersion>('/prompts/active');
  } catch {
    return MOCK_PROMPTS.find((p) => p.is_active)!;
  }
}

export async function introspect(): Promise<IntrospectionResult> {
  try {
    return await apiFetch<IntrospectionResult>('/prompts/introspect');
  } catch {
    return MOCK_INTROSPECTION;
  }
}

export async function improvePrompt(): Promise<ImprovePromptResponse> {
  try {
    return await apiFetch<ImprovePromptResponse>('/prompts/improve', { method: 'POST' });
  } catch {
    await new Promise((r) => setTimeout(r, 6000));
    return {
      proposed_prompt: MOCK_PROMPTS[2],
      diff: MOCK_DIFF,
      introspection: MOCK_INTROSPECTION,
    };
  }
}

export async function deployPrompt(version: string): Promise<void> {
  try {
    await apiFetch(`/prompts/deploy/${version}`, { method: 'POST' });
  } catch {
    console.log('Mock deploy:', version);
  }
}
