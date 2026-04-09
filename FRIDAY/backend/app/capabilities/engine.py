import subprocess
import platform

class ActionEngine:
    def __init__(self):
        self.os_type = platform.system()

    def execute(self, intent: str, command_args: str = None) -> str:
        if intent == "weather":
            return "Executing weather check..."
        elif intent == "system":
            return self._execute_system_command(command_args)
        else:
            return f"Action for intent '{intent}' not found."

    def _execute_system_command(self, cmd: str) -> str:
        try:
            # ONLY FOR DEMO PURPOSES. UNRESTRICTED SUBPROCESS IS DANGEROUS!
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            return result.stdout or result.stderr
        except Exception as e:
            return f"System command failed: {e}"

engine = ActionEngine()
