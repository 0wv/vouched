import { EmbedBuilder } from "discord.js"


export default class EmbedMe extends EmbedBuilder {
	constructor() {
		super();
	}

	public setSuccess(): this {
		this.setColor(0x302c34);
		return this;
	}

	public setInvisible(): this {
		this.setColor(0x2B2D31);
		return this;
	}

	public setFailure(): this {
		this.setImage("https://cdn.discordapp.com/attachments/830490352691314750/1124884885228761119/red_bar.png").setColor(0x302c34);
		return this;
	}

	public setWarning(): this {
		this.setImage("https://cdn.discordapp.com/attachments/830490352691314750/1124884885769814056/yellow_bar.png").setColor(0x302c34);
		return this;
	}

	public setInfo(): this {
		this.setImage("https://cdn.discordapp.com/attachments/895632161057669180/930131378379554876/void_default_bar.PNG").setColor(0x302c34);
		return this;
	}

	public setDebug(): this {
		this.setImage("https://cdn.discordapp.com/attachments/830490352691314750/1129846831363395664/debug_bar.png").setColor(0x302c34);
		return this;
	}
}