import appDatasource from './config/datasource';
import server from './server';
import colors from "colors";

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

server.listen(port, host, () => {
    console.log(colors.green.bold(`Server is running on port ${port}`));
});

appDatasource.initialize().then(async () => {
    console.log(colors.green.bold("Data Source has been initialized"));
}).catch((e) => console.log(colors.red.bold(`Error during Data Source initialization: ${e}`)));