class IncidentStore:

    def __init__(self):
        self.incidents = {}


    def create_incident(
        self,
        commit,
        error
    ):

        self.incidents[commit] = {
            "commit": commit,
            "error": error,
            "status": "OPEN"
        }


    def get_open_incidents(self):

        return [
            incident
            for incident in self.incidents.values()
            if incident["status"] == "OPEN"
        ]


    def close_incident(
        self,
        commit
    ):

        if commit in self.incidents:
            self.incidents[commit]["status"] = "CLOSED"



class EventRouter:


    def __init__(
        self,
        diagnosis_graph,
        judge_graph,
        github_service,
        incident_store
    ):

        self.diagnosis_graph = diagnosis_graph
        self.judge_graph = judge_graph
        self.github_service = github_service
        self.incident_store = incident_store



    def handle_event(
        self,
        payload
    ):

        print("\nEVENT ROUTER")
        print(payload)


        # from server.py
        sha = payload["commit"]

        repo = payload["repo"]


        status = self.github_service.get_ci_status(
            repo,
            sha
        )


        print(
            "CI STATUS:",
            status
        )


        if status == "failure":

            self.handle_failure(
                sha,
                repo
            )


        elif status == "success":

            self.handle_success(
                sha,
                repo
            )


        else:

            print(
                "CI still running"
            )



    def handle_failure(
        self,
        sha,
        repo
    ):


        open_incidents = (
            self.incident_store
            .get_open_incidents()
        )


        # check duplicate failure
        for incident in open_incidents:


            if incident["commit"] == sha:

                print(
                    "Old failure. Ignoring"
                )

                return



        print(
            "New failure detected"
        )


        self.incident_store.create_incident(
            sha,
            "CI pipeline failed"
        )



        # run diagnosis

        self.diagnosis_graph.invoke(
            {

                "failure_log":
                    self.github_service.get_failure_logs(
                        repo,
                        sha
                    ),

                "actual_fix": "",

                "diagnosis": {},

                "evaluation": {}
            }
        )



    def handle_success(
        self,
        sha,
        repo
    ):


        incidents = (
            self.incident_store
            .get_open_incidents()
        )


        if not incidents:

            print(
                "No previous failures"
            )

            return



        for incident in incidents:


            print(
                "Possible fix detected"
            )


            self.judge_graph.invoke(
                {

                "failure_log":
                    incident["error"],


                "actual_fix":
                    f"Commit {sha} fixed issue",


                "diagnosis": {},


                "evaluation": {}

                }
            )


            self.incident_store.close_incident(
                incident["commit"]
            )


            print(
                "Incident closed:",
                incident["commit"]
            )