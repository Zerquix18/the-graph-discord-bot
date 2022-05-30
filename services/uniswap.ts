import { ApolloClient, InMemoryCache, NormalizedCacheObject } from "@apollo/client/core";
import { THE_GRAPH_API_URL } from "../constants";
import { IPartialPool, IPool } from "../models";
import * as queries from '../queries';

const UNISWAP_GRAPH_ID = 'J2rE1w6gd3GD5f8p73iGbRvA1KSWRUFuouBtdmPXNZeE';

class UniswapService {
  client: ApolloClient<NormalizedCacheObject>;

  constructor() {
    const API_URL = THE_GRAPH_API_URL + UNISWAP_GRAPH_ID;
    
    const uri = API_URL;
    const cache = new InMemoryCache({ addTypename: false });

    this.client = new ApolloClient({ uri, cache });
  }

  async getPools(): Promise<IPartialPool[]> {
    const query = queries.uniswapGetPools;
    
    try {
      const result = await this.client.query({ query });
      const data = result.data.pools.map((item: any) => ({ ...item, exchange: 'uniswap' }));

      return data;
    } catch (e) {
      throw e;
    }
  }

  async getPool(id: string): Promise<IPool> {
    const query = queries.uniswapGetPool;
    const variables = { id };

    try {
      const result = await this.client.query({ query, variables });
      const data = { ...result.data.pool };

      data.token0Price = parseFloat(data.token0Price);
      data.token1Price = parseFloat(data.token1Price);
      data.volumeUSD = parseFloat(data.volumeUSD);
      data.volumeToken0 = parseFloat(data.volumeToken0);
      data.volumeToken1 = parseFloat(data.volumeToken1);
      data.collectedFeesUSD = parseFloat(data.collectedFeesUSD);

      return data;
    } catch (e) {
      throw e;
    }
  }
}

export default UniswapService;
