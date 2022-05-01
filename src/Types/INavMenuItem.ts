import { strings } from "../l8n";

export interface INavMenuItem {
	id: keyof typeof strings;
	location: string;
}
