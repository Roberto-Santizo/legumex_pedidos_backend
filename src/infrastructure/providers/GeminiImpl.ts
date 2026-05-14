import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";
import { IAProvider } from "../../domain/providers/IAProvider";
import { Client, Dc } from "../../entities/entities";

export class GeminiImpl implements IAProvider {
    private ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    }

    async uploadFile(file: Express.Multer.File, dcs: Dc[], clients: Client[]): Promise<string> {
        const image = await this.ai.files.upload({
            file: new Blob([new Uint8Array(file.buffer)], { type: file.mimetype })
        });

        const optimizedDcs = dcs.map(dc => ({ id: dc.id, name: dc.name, code: dc.code, client: dc.client.name }));

        const response = await this.ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: [
                createUserContent([
                    `
                        Analiza el archivo y devuelve un JSON válido con la siguiente estructura:
                            [
                                {
                                    "client": {
                                        "id": number,
                                        "name": string
                                    },

                                    "dc": {
                                        "id": number,
                                        "name": string
                                    } | null,

                                    "po": string,
                                    "required_delivery_date": string,
                                    
                                    "products": [
                                        {
                                            "code": string,
                                            "quantity": number,
                                            "supplierStock": string
                                        }
                                    ]
                                }
                                                    
                            ]
                            
                            Instrucciones:
                            0. Hojas vacias:
                            - En tal caso se encuentre una hoja sin datos solamente ignorala y pasa a la siguiente
                            - En tal caso se encuentren dcs, clients o productos sin datos, ignoralos y no los incluyas en el resultado final
                            - El código de producto esta generalmente en la columna "item" o una nomenclatura similar

                            1. Extrae:
                            - "client": nombre del cliente
                            - "Ship To": dirección de entrega (usar esta SOLO para determinar el distribution center)
                            - "products": lista de productos con su código, cantidad y supplier stock
                            - "required_delivery_date": es la fecha en la que el cliente requiere la entrega de los productos, extraerla en formato string (ej: "yyyy-mm-dd")
                            - "po": Purchase Order Number

                            2. Determinar el "dc" (distribution center):
                            - Usa la "shipping_address" como fuente principal para identificar el DC.
                            - Si la shipping address contiene un número que coincide con un DC code dentro del nombre, prioriza ese match por encima de cualquier otro.
                            - Compara esos tokens contra:
                            a) el "code" del DC
                            b) la dirección asociada al DC (si existe)

                            Regla OBLIGATORIA para seleccionar el DC:
                            1. Primero filtra los DCs por el cliente extraído.
                            2. SOLO usa los DCs que pertenezcan a ese cliente.
                            3. Si el código no conicide con el código extraido NO ASIGNES DC Y COLOCALO NULO, ten mucho cuidado colocando el DC correspondiente, realiza siempre la validación del código

                            DISTRIBUTION CENTERS:
                            ${JSON.stringify(optimizedDcs)}
                            - Las coincidencias tienen que ser exactas.
                            
                            3. Determina el cliente:
                            - Usa la información del documento para encontrar el cliente que coincida con la siguiente información:

                            CLIENTES:
                            ${JSON.stringify(clients)}

                            - Busca coincidencias por nombre, ciudad, dirección o palabras clave relevantes.
                            - La comparación debe ser flexible (ignorar mayúsculas, minúsculas y espacios).
                            - Si encuentras coincidencia, devuelve el objeto COMPLETO (id y name).
                            - Si no hay coincidencias claras, devuelve "dc": null.

                            4. Reglas para productos:
                            - Extrae únicamente productos válidos.
                            - "code" debe ser el identificador del producto.
                            - "quantity" debe ser numérico.

                            5. Reglas de salida:
                            - Devuelve SOLO JSON válido.
                            - No incluyas explicaciones ni texto adicional.
                            - No inventes datos si no están presentes en el archivo.

                            6. Manejo de errores:
                            - Si falta algún dato, usa null en lugar de inventarlo.
                    `,
                    createPartFromUri(image.uri ?? '', image.mimeType ?? '')
                ])
            ],
            config: {
                responseMimeType: 'application/json'
            }
        });

        return JSON.parse(response.text);
    }

}