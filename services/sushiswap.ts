import { ApolloClient, InMemoryCache, NormalizedCacheObject } from "@apollo/client/core";
import { THE_GRAPH_API_URL } from "../constants";
import { IPartialPool, IPool } from "../models";
import * as queries from '../queries';

const UNISWAP_GRAPH_ID = 'D7azkFFPFT5H8i32ApXLr34UQyBfxDAfKoCEK4M832M6';

class SushiswapService {
  client: ApolloClient<NormalizedCacheObject>;

  constructor() {
    const API_URL = THE_GRAPH_API_URL + UNISWAP_GRAPH_ID;
    
    const uri = API_URL;
    const cache = new InMemoryCache({ addTypename: false });

    this.client = new ApolloClient({ uri, cache });
  }

  async getPools(): Promise<IPartialPool[]> {
    const query = queries.sushiswapGetPairs;
    const variables = {
      last_id: '',
    };

    let pools: IPartialPool[] = [];
    while (true) {
      try {
        const result = await this.client.query({ query, variables });
        const data = result.data.pairs.map((item: any) => ({ ...item, exchange: 'sushiswap' }));
        if (data.length === 0) {
          break;
        }

        pools = pools.concat(data);
        variables.last_id = data[data.length - 1].id;
      } catch (e) {
        throw e;
      }
    }

    return pools;
  }

  async getPool(id: string): Promise<IPool> {
    const query = queries.sushiswapGetPair;
    const variables = { id };

    try {
      const result = await this.client.query({ query, variables });
      const data = { ...result.data.pair };

      data.token0Price = parseFloat(data.token0Price);
      data.token1Price = parseFloat(data.token1Price);
      data.volumeUSD = parseFloat(data.volumeUSD);
      data.volumeToken0 = parseFloat(data.volumeToken0);
      data.volumeToken1 = parseFloat(data.volumeToken1);

      return data;
    } catch (e) {
      throw e;
    }
  }
}

export default SushiswapService;
