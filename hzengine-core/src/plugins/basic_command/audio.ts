import { HZEngineCore } from "../..";
import Path from "../../utils/path";

export function audio_command(core: HZEngineCore) {
  // play command: play <channel> "<path>"
  core.script.use((ctx, next) => {
    if (
      ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "play" &&
      ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "queue"
    )
      return next();
    if (ctx.slicedArgs.length !== 3)
      throw `${ctx.slicedArgs[0].str.toUpperCase()} Command: incorrect amount of args`;
    if (!ctx.slicedArgs[2].isQuoted)
      throw `the third arg of ${ctx.slicedArgs[0].str} command should be quoted as string path`;

    let channel_name = ctx.slicedArgs[1].str;
    let path = ctx.slicedArgs[2].str;

    core.debug.log(`Play Command: play ${channel_name} ${path}`);

    let channel = core.audio.channels[channel_name];

    if (!channel) {
      throw `audio channel ${channel_name} not found`;
    }

    if (ctx.slicedArgs[0].str !== "queue") {
      channel.stop();
    }
    channel.push({ path: Path.join(core.storage.projectRoot!, "audio", path) });
    channel.play();
  });

  // stop command: stop <channel>
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "stop") {
      return next();
    }
    if (ctx.slicedArgs.length !== 2) {
      throw `Stop Command: incorrect amount of args`;
    }

    let channel_name = ctx.slicedArgs[1].str;

    let channel = core.audio.channels[channel_name];

    if (!channel) {
      throw `audio channel ${channel_name} not found`;
    }
    channel.stop();
  });
}
