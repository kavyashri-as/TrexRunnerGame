import { CopilotClient } from "@github/copilot-sdk";

const client = new CopilotClient();
const session = await client.createSession({
  skillDirectories: ["./skills"],
  onPermissionRequest: async () => ({ kind: "approve-once" }),
  //disabledSkills: ["trex-code-review"]
});

const reply = await session.sendAndWait({
  prompt: "Review ui/js/Obstacle.js for issues.",
});

console.log(reply);
