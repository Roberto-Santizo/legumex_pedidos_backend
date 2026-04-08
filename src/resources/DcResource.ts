import { Dc } from "../entities/Dc";

export class DcResource {
    static json(dc: Dc) {
        return {
            id: dc.id,
            name: dc.name,
            client: dc.client.name
        }
    }

    static collection(dcs: Dc[]) {
        return dcs.map(dc => this.json(dc));
    }
}