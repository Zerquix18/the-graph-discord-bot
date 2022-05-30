import { gql } from "@apollo/client/core";

export const uniswapGetPools = gql`
  {
    pools {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`;

export const uniswapGetPool = gql`
  query uniswapGetPool($id: ID!) {
    pool(id: $id) {
      id
      token0Price
      token1Price
      volumeUSD
      volumeToken0
      volumeToken1

      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`;

export const sushiswapGetPairs = gql`
  query sushiswapGetPools($last_id: String) {
    pairs(first: 1000, where: { id_gt: $last_id }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`;

export const sushiswapGetPair = gql`
  query sushiswapGetPool($id: ID!) {
    pair(id: $id) {
      id
      token0Price
      token1Price
      volumeUSD
      volumeToken0
      volumeToken1

      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`;
