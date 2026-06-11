import os
from github import Github


class GitHubService:


    def __init__(self):

        token = os.getenv(
            "GITHUB_TOKEN"
        )

        self.client = Github(token)



    def get_repo(self, repo_name):

        return self.client.get_repo(
            repo_name
        )



    def get_commit(self, repo_name, sha):

        repo = self.get_repo(
            repo_name
        )

        return repo.get_commit(
            sha
        )



    # -----------------------------
    # CI STATUS
    # -----------------------------

    def get_ci_status(
        self,
        repo_name,
        sha
    ):

        repo = self.get_repo(
            repo_name
        )


        runs = (
            repo
            .get_workflow_runs(
                head_sha=sha
            )
        )


        for run in runs:

            if run.status == "completed":

                return run.conclusion


        return "running"



    # -----------------------------
    # FAILURE LOGS
    # -----------------------------

    def get_failure_logs(
        self,
        repo_name,
        sha
    ):


        repo = self.get_repo(
            repo_name
        )


        runs = (
            repo
            .get_workflow_runs(
                head_sha=sha
            )
        )


        for run in runs:


            if run.conclusion == "failure":


                print(
                    "Failed workflow:",
                    run.name
                )


                # github API does not directly
                # give logs from PyGithub
                # need requests here


                return (
                    "Workflow failed. "
                    "Check actions logs."
                )


        return None



    # -----------------------------
    # COMMIT DIFF
    # -----------------------------

    def get_diff(
        self,
        repo_name,
        old_sha,
        new_sha
    ):


        repo = self.get_repo(
            repo_name
        )


        comparison = repo.compare(
            old_sha,
            new_sha
        )


        changes=[]


        for file in comparison.files:


            changes.append({

                "file":
                    file.filename,

                "status":
                    file.status,

                "patch":
                    file.patch

            })


        return changes