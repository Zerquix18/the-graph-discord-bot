import * as dotenv from 'dotenv';
dotenv.config();

export const THE_GRAPH_API_URL = `https://gateway.thegraph.com/api/${process.env.THE_GRAPH_API_KEY}/subgraphs/id/`;
