require('../../css/index.scss');

import { StateBus } from "../class/stateBus";

const bus = new StateBus();

bus.render();

setTimeout(() => {
  console.log('start');
  bus.startGame();
}, 1000);