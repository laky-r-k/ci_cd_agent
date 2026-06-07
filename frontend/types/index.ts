export type FailureCategory =
  | 'INFRASTRUCTURE_FAILURE'
  | 'DEPENDENCY_FAILURE'
  | 'TEST_FAILURE'
  | 'FLAKY_TEST'
  | 'BUILD_ERROR'
  | 'DEPLOYMENT_ERROR'
  | 'SECURITY_FAILURE'
  | 'CONFIGURATION_ISSUE';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FailureStatus = 'PENDING' | 'DIAGNOSED' | 'OUTCOME_RECORDED';
export type OutcomeResult = 'CORRECT' | 'INCORRECT';

export interface Failure {
  id: string;
  repository: string;
  branch: string;
  commit_sha: string;
  category: FailureCategory;
  confidence: number;
  severity: Severity;
  status: FailureStatus;
  root_cause: string;
  affected_files: string[];
  recommended_fix: string;
  timestamp: string;
  prompt_version: string;
  prompt_used?: string;
  agent_response?: string;
  tool_calls?: ToolCall[];
  latency_ms?: number;
  token_usage?: TokenUsage;
  phoenix_trace_url?: string;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output: string;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

export interface Outcome {
  failure_id: string;
  result: OutcomeResult;
  actual_category?: FailureCategory;
  notes?: string;
}

export interface AnalyticsAccuracy {
  overall_accuracy: number;
  total_diagnoses: number;
  correct_diagnoses: number;
  incorrect_diagnoses: number;
  accuracy_by_category: { category: FailureCategory; accuracy: number; count: number }[];
  weak_spots: { category: FailureCategory; accuracy: number }[];
}

export interface TrendPoint {
  date: string;
  accuracy: number;
}

export interface PromptVersion {
  version: string;
  content: string;
  accuracy: number;
  diagnosis_count: number;
  created_at: string;
  is_active: boolean;
  status: 'ACTIVE' | 'ARCHIVED' | 'PROPOSED';
}

export interface IntrospectionResult {
  weak_categories: FailureCategory[];
  misclassification_patterns: { from: FailureCategory; to: FailureCategory; count: number }[];
  suggested_improvements: string[];
}

export interface ImprovePromptResponse {
  proposed_prompt: PromptVersion;
  diff: DiffLine[];
  introspection: IntrospectionResult;
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}
