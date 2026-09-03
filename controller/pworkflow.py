#checks previous workflow run ...if the error previously occured its not new error 

from services.logs import git_log_fetcher
from config import GITHUB_TOKEN

def get_failed_step(run):
    """Helper: Finds exactly which step crashed in a workflow run."""
    if run.conclusion != "failure":
        return None
    for job in run.jobs():
        if job.conclusion == "failure":
            for step in job.steps:
                if step.conclusion == "failure":
                    return f"{job.name} -> {step.name}"
    return "unknown"



def is_new_error(branch_name="main"):
    log_fetcher = git_log_fetcher(
        repo_name="laky-r-k/cd_test_repo",
        git_token=GITHUB_TOKEN
    )
    
    # 1. Strictly filter by branch to prevent cross-contamination
    runs = log_fetcher.repo.get_workflow_runs(branch=branch_name)
    
    if runs.totalCount == 0:
        return "pass"
        
    latest_run = runs[0]
    
    # If this is the very first run ever on this branch
    if runs.totalCount == 1:
        return "pass" if latest_run.conclusion == "success" else "new"

    previous_run = runs[1]
    
    # 2. Safely handle all SUCCESS scenarios first
    if latest_run.conclusion == "success":
        if previous_run.conclusion != "success":
            return "solved"  # You fixed a broken pipeline!
        return "pass"        # It was passing, and it's still passing.

    # 3. Handle FAILURE scenarios
    if previous_run.conclusion == "success":
        return "new"  # It was passing, but your last commit broke it.
        
    # 4. Both failed. We MUST compare exactly where they crashed.
    latest_error = get_failed_step(latest_run)
    previous_error = get_failed_step(previous_run)
    
    if latest_error == previous_error:
        print(f"Match: Both failed at {latest_error}")
        return "old"  # Failed for the exact same reason.
    else:
        print(f"Mismatch: Old failed at {previous_error}, New failed at {latest_error}")
        return "new"  # Failed for a completely different reason.
    
from services.github_data_extractor import commit_data_extractor
from services.logs import git_log_fetcher
class eventhandler:
    def __init__(self,diagnosis_graph,judge_graph,):
        self.diagnosis_agent = diagnosis_graph
        self.judge_agent = judge_graph
        self.git_log_fetcher = git_log_fetcher(
            repo_name="laky-r-k/cd_test_repo",
            git_token=GITHUB_TOKEN
        )

    def handle(self):
        log = self.git_log_fetcher.fetch_latest_workflow_logs(branch="main")
        type_of_error = is_new_error(log)
        if type_of_error=="new":
            self.diagnosis_agent.invoke()
        elif type_of_error == "solved":
            pass
        elif type_of_error == "old":
            pass
        else:
            pass

if __name__ == "__main__":
    result = is_new_error()
    print(f"Error classification result: {result}")