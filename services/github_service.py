import os
import time
import requests
from github import Github
from config import GITHUB_TOKEN

class GitHubService:


    def __init__(self):

        token = GITHUB_TOKEN

        self.client = Github(token)

        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json"
        }



    def get_repo(self, repo_name):

        return self.client.get_repo(
            repo_name
        )



    def get_commit(
        self,
        repo_name,
        sha
    ):

        repo = self.get_repo(repo_name)

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


        for i in range(10):

            runs = repo.get_workflow_runs(
                head_sha=sha
            )


            if runs.totalCount == 0:

                print(
                    "No workflow found yet"
                )

                time.sleep(5)
                continue



            run = runs[0]


            print(
                "Workflow:",
                run.name,
                "STATUS:",
                run.status,
                "RESULT:",
                run.conclusion
            )



            if run.status == "completed":


                if run.conclusion == "success":

                    return "success"


                if run.conclusion == "failure":

                    return "failure"



            time.sleep(5)



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


        runs = repo.get_workflow_runs(
            head_sha=sha
        )


        if runs.totalCount == 0:
            return "No CI run found"



        run = runs[0]


        if run.conclusion != "failure":

            return "No failure"



        print(
            "Failed workflow:",
            run.name
        )


        # download logs

        url = (
            f"https://api.github.com/repos/"
            f"{repo_name}/actions/runs/"
            f"{run.id}/logs"
        )


        response = requests.get(
            url,
            headers=self.headers
        )


        if response.status_code == 200:

            return (
                "CI failed.\n"
                "Logs available at workflow run."
            )


        return (
            "Workflow failed but logs unavailable"
        )





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