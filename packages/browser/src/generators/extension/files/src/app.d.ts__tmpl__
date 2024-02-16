type CounterRequest = {
  type: 'COUNTER_REQUEST';
  change: number;
};
type CounterResponse = {
  type: 'COUNTER_RESPONSE';
  counter: number;
  persistentCounter: number;
};
type OtherRequest = {
  type: 'OTHER_REQUEST';
  tbd: string;
};
type OtherResponse = {
  type: 'OTHER_RESPONSE';
  data: { info: string; category: number };
};
type ExtensionRequest = CounterRequest | OtherRequest;
type ExtensionResponse = CounterResponse | OtherResponse;

type StorageState = {
  color?: string;
};
