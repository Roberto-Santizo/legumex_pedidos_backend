import { Dc } from "../entities/entities";

export class DcResource {
    static json(dc: Dc) {
        return {
            id: dc.id,
            name: dc.name,
            client: dc.client.name,
            code: dc.code,
            warehouse: dc.warehouse
        }
    }

    static collection(dcs: Dc[]) {
        return dcs.map(dc => this.json(dc));
    }
}