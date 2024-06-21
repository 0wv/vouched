import { EmbedBuilder } from "discord.js"


export default class EmbedMe extends EmbedBuilder {
  [x: string]: any;
  id: any | string;
	constructor() {
		super();
	}

	public setSuccess(): this {
		this.setColor(0x2EFF5B);
		return this;
	}

	public setInvisible(): this {
		this.setColor(0x2B2D31);
		return this;
	}

	public setMain(): this {
		this.setImage("https://cdn.discordapp.com/attachments/1251331189952872458/1253660440169287731/eDLDVqG.png?ex=6676a9c4&is=66755844&hm=7ed609270db61a1c8983a10224f26255222ed55f4588884f0b7d2ed8e66937c5&").setColor(0x88abf9);
		return this;
	}

	public setFailure(): this {
		this.setImage("https://cdn.discordapp.com/attachments/830490352691314750/1124884885228761119/red_bar.png").setColor(0x302c34);
		return this;
	}


	public setInfo(): this {
		this.setColor(0x302c34);
		return this;
	}

	public setDebug(): this {
		this.setImage("https://cdn.discordapp.com/attachments/830490352691314750/1129846831363395664/debug_bar.png").setColor(0x302c34);
		return this;
	}
}