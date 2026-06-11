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
            x for x in self.incidents.values()
            if x["status"] == "OPEN"
        ]


    def close_incident(
        self,
        commit
    ):
        self.incidents[commit]["status"]="CLOSED"


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



    def handle_event(self,payload):

        commit = payload["commits"][0]

        sha = commit["id"]


        status = self.github_service.get_ci_status(
            sha
        )


        if status == "failure":

            self.handle_failure(
                sha
            )


        elif status == "success":

            self.handle_success(
                sha
            )
    def handle_failure(self,sha):


        open_incidents = (
        self.incident_store
        .get_open_incidents()
    )


    # already tracking this failure
        for incident in open_incidents:

            if incident["commit"] == sha:
                print(
              "Old failure. Ignore"
            )
                return



    # NEW FAILURE

        print(
      "New failure detected"
    )


        self.incident_store.create_incident(
        sha,
        "ci failure"
    )


        self.diagnosis_graph.invoke(
        {
          "commit":sha
        }
    )
        

    def handle_success(self,sha):

        incidents = (
            self.incident_store
        .get_open_incidents()
    )


        if not incidents:
            print(
          "Nothing to evaluate"
        )
            return


        for incident in incidents:

            print(
          "Possible fix found"
        )


            self.judge_graph.invoke(
          {
            "failure_commit":
                 incident["commit"],

            "fix_commit":
                 sha
          }
        )


            self.incident_store.close_incident(
             incident["commit"]
        )
    

    