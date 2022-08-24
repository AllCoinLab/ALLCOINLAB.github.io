'use strict'

// display with space in 3nums
async function handleInput(e, id, func) {
  let vI = e.target.value;
  vI = vI.replace(/,/g, '.'); // some use , to .
  vI = vI.replace(/ /g, ''); // erase space
  if (vI == '') {
    vI = 0;
  }
  e.target.value = SPACE(vI);
  vI = INT(vI, 5); // precision 5
  
  let ot = select(id);
  if (vI == 0) {
    ot.value = 0;
    return;
  }
  
  let bvI = BIG(vI);
  let bvO = await func(bvI);
  let vO = ETH(BIGINT(bvO));
  
  console.log(bvI, bvO, vO);
  vO = INT(vO, 5);
  
  ot.value = SPACE(vO);
}

// input output display, switch, buy
async function handleInputSwap(e, id, rI, rO) {
  await handleInput(e, id, async (v) => {
    return await v * rO / rI;
  });
}



async function _setSwapRate(names) {
  let msg = ``;
  msg += `1 ${names[0]} = ${ROUND(RESERVES['output'] / RESERVES['input'], 10)} ${names[1]}`;
  select('#swap-rate').innerHTML = msg;
}
async function setSwapRate() {
  _setSwapRate([select(`#swap-input-name`).innerHTML, select(`#swap-output-name`).innerHTML]);
}

async function clearEvent(elm) {
  let elm_ = elm.cloneNode(true);
  elm.parentNode.replaceChild(elm_, elm);
}

async function setFuncs() {
  clearEvent(select(`#swap-input-value`));
  select(`#swap-input-value`).addEventListener('input', async (e) => {
    await handleInputSwap(e, '#swap-output-value', RESERVES['input'], RESERVES['output']);
  });
}

let STATES = {};
async function swapSwitch() {
  let names = [select(`#swap-input-name`).innerHTML, select(`#swap-output-name`).innerHTML];
  [select(`#swap-input-name`).innerHTML, select(`#swap-output-name`).innerHTML] = SWAP(names);
  let values = [select(`#swap-input-value`).value, select(`#swap-output-value`).value];
  [select(`#swap-input-value`).value, select(`#swap-output-value`).value] = SWAP(values);

  RESERVES = {
    'input': RESERVES['output'], 
    'output': RESERVES['input'],
  };
  CURTOKENS = {
    'input': CURTOKENS['output'], 
    'output': CURTOKENS['input'],
  };

  await setToken();
}


async function getPair(tI, tO) {
  let pair = await CONTS[`dog-${CURDEX}-factory`].getPair(tI, tO);
  if (pair == "0x0000000000000000000000000000000000000000") {
    return [true, [pair]];
  }

  // balance?
  return [false, [pair]];
}

async function getR(pair) {
  setConts(`t`, pair, ABIS['pair']);
  let r = await CONTS[`t`].getReserves();

  return [r[0] / 1, r[1] / 1];
}

async function setToken() {
  let [res, data] = await getPair(CURTOKENS['input'], CURTOKENS['output']);
  if (res) {
    return [true, data];
  }
  let pair = data[0];

  let r = await getR(pair);
  RESERVES = {
    'input': r[0],
    'output': r[1],
  };

  for (let target of ['input', 'output']) {
    setConts(`${CURCHAIN}-${target}`, CURTOKENS[target], ABIS['token']);
    // let name = await CONTS[`${CURCHAIN}-${target}`].name();
    let symbol = await CONTS[`${CURCHAIN}-${target}`].symbol();
    let decimals = await CONTS[`${CURCHAIN}-${target}`].decimals();
    select(`#swap-${target}-name`).innerHTML = symbol;

    RESERVES[target] = RESERVES[target] / 10**decimals;
  }
  
  await setFuncs();

  await setSwapRate();

  select('#dexscreen').src += '';
}

let RESERVES = {
  'input': 1,
  'output': 1,
};
let CURCHAIN = 'dog';
let DEX_NAMES = {
  'dog': {
    'max': 'MaxSwap',
    'dog': 'DogeSwap',
    'yod': 'yodeSwap',
    'qui': 'QuickSwap',
  }
}
let CURDEX = 'max';

let CURTOKENS = {
  'input': ADRS['dog-usdc'],
  'output': ADRS['dog-usdt'],
};


STATES['swap'] = true;
(async () => {
  await setToken();
	await swapSwitch();
})();

async function swapRun() {
  let aI = select(`#swap-input-value`).value.replace(/ /g, '');
  let aO = select(`#swap-output-value`).value.replace(/ /g, '');
  let msg = ``;
  msg += `swap process\n`;
  msg += `from ${aI} ${select(`#swap-input-name`).innerHTML}\n`;
  msg += `to ${aO} ${select(`#swap-output-name`).innerHTML}\n`;
  
  displayText('#swap-msg', msg);

  return 0;
}

async function swapTx() {
  let aI = select(`#swap-input-value`).value.replace(/ /g, '');
  {
    let decimals = await CONTS[`${CURCHAIN}-input`].decimals();
    aI = INT(FLOAT(aI) * 10**decimals);
  }
  let aO = select(`#swap-output-value`).value.replace(/ /g, '');
  {
    let decimals = await CONTS[`${CURCHAIN}-output`].decimals();
    aO = INT(FLOAT(aO) * 10**decimals);
  }

  if (!CURADR) {
    alert('connect wallet');
    return;
  }
  
  let args = [aI, INT(aO * 0.97), [CURTOKENS['input'], CURTOKENS['output']], CURADR, NOW() + 1000];
  l(args);
  await SEND_TX(`dog-${CURDEX}-router`, 'swapExactTokensForTokensSupportingFeeOnTransferTokens', args);
}



async function selectDex(name) {
  displayText('#dex-type', DEX_NAMES['dog'][name]);
  CURDEX = name;
}



let CURSETTARGET = 'input';
async function openSelectToken(target) {
  CURSETTARGET = target;
  select('#input-token-info').value = '';
  displayText('#token-info', `no address set`);
}

select('#conn').onclick = async () => { await conn(); };
select(`#swap-switch`).onclick = async () => { await swapSwitch(); };
select(`#swap-run`).onclick = async () => { await swapRun(); };
select(`#swap-tx`).onclick = async () => { await swapTx(); };
select(`#swap-approve`).onclick = async () => {
  setConts(`${CURCHAIN}-token`, CURTOKENS['input'], ABIS['token']);
  await SEND_TX(`${CURCHAIN}-token`, 'approve', [ADRS[`dog-${CURDEX}-router`], UINT256MAX]);
};


select('#input-token-info').addEventListener('input', async (e) => {
  async function invalid(s) {
    displayText('#token-info', s);
    select('#token-info-set').onclick = async () => {
      alert(s);
    };
  }
  let adr;
  try {
    adr = ADR(e.target.value, false);
  } catch (e) {
    await invalid(`invalid address`);
    return;
  }
  setConts(`${CURCHAIN}-temp`, adr, ABIS['token']);

  let name;
  try {
    name = await CONTS[`${CURCHAIN}-temp`].name();
  } catch (e) {
    await invalid(`invalid address`);
    return;
  }

  let symbol = await CONTS[`${CURCHAIN}-temp`].symbol();
  displayText('#token-info', `${name} (${symbol})`);

  {
    let adrs;
    if (CURSETTARGET == 'input') {
      adrs = [adr, CURTOKENS['output']];
    } else {
      adrs = [CURTOKENS['input'], adr];
    }
    let [res, data] = await getPair(adrs[0], adrs[1]);
    if (res) {
      await invalid(`${name} (${symbol}) [NO PAIR]`);
      return;
    }
  }

  select('#token-info-set').onclick = async () => { 
    CURTOKENS[CURSETTARGET] = adr;

    setToken();
  };
});


async function checkAllowance(adr) {
  if (!CURADR) {
    alert('wallet connect first');
    return true;
  }

  setConts(`${CURCHAIN}-temp`, adr, ABIS['token']);
  
  let allowance = await CONTS[`${CURCHAIN}-temp`].allowance(CURADR, ADRS[`dog-${CURDEX}-router`]);
  if (0 < allowance) {
    return false;
  }

  return true;
}

async function runPersonal() {
  await checkAllowance(CURTOKENS['input']);
}

(async () => {
  await getCurAdr();
  if (CURADR == null) {
    // connect wallet button
    return;
  }

  await runPersonal();
})();


console.log('main done');