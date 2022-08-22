'use strict'

let isBrowser = typeof window !== 'undefined'
    && ({}).toString.call(window) === '[object Window]';

let isNode = typeof global !== "undefined" 
    && ({}).toString.call(global) === '[object global]';

if (isNode) {
  console.log('node');
  var ethers = require('ethers');
}

////////////////////////////////////////////////////////////////////////// script

function loadScript(url, callback) {
  let body = document.body;
  let script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;

  script.onreadystatechange = callback;
  script.onload = callback;
  script.async = false;

  body.appendChild(script);
}

let isScriptLoaded = 0;
function loadScriptDone() {
	isScriptLoaded += 1;
}

const SCRIPTS = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js",
	"https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js",
	"https://cdn.jsdelivr.net/npm/rangeslider.js@2.3.3/dist/rangeslider.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js",
  "https://cdn.jsdelivr.net/gh/upfinity-main/TheWeb3ProjectAssets/js/web3.min.js",
  "https://cdn.jsdelivr.net/gh/upfinity-main/TheWeb3ProjectAssets/js/detect-provider.min.js",
  "https://cdn.jsdelivr.net/gh/upfinity-main/TheWeb3ProjectAssets/js/ethers.umd.min.js",
];

// for (const script of SCRIPTS) { // script load not working and pending too much
// 	loadScript(script, loadScriptDone);
// } 

/////////////////////////////////////////////////////////// base

function KEYS(dict) {
	return Object.keys(dict);
}

function FLOAT(v) { // for default precision
  return parseFloat(v);
}

function INT(v, n=0) {
  v = FLOAT(v);
  if (n == 0) {
    return parseInt(v);
  }
  
  return parseInt(v * 10**n) / 10**n;
}

function ROUND(v, n=0) {
  return v.toFixed(n);
}

function BIGINT(v) {
  return BigInt(v);
}

////////////////////// str
function STR(s) {
	return String(s);
}

function WRAP(v) {
	return "[" + STR(v) + "]";
}

function COMMA(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function SPACE(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
}

////////////////////// time
function NOW() {
  return Date.now();
}

function ADELAY(milSec) { //////////////////////////////// sync but return promise
  return new Promise(r => setTimeout(r, milSec));
}

function DELAY(milSec) {
  var start = new Date().getTime();
  var end = 0;
  while ((end - start) < milSec) {
    end = new Date().getTime();
  }
}




function INCR(v) {
  return v + 1;
}
function DECR(v) {
  return v - 1;
}

function TOGGLE(b) {
  if (b) {
    return false;
  } else {
    return true;
  }
}

function SWAP(v) {
  return [v[1], v[0]];
}


/////////////////////////////////////////////////////// web3

const CHAINIDS = {
	'eth': 1,
  'bsc': 56,
  // 'pol': 137,
  // 'kcc': 70,
  'dog': 2000,
};
const CHAINNAMES = KEYS(CHAINIDS);


const BNBDIV = 10**18;
const UINT256MAX = 2**256 - 1;

const ADRS = {};
const ABIS = {};
ADRS['zero'] = "0x0000000000000000000000000000000000000000";
ADRS['dead'] = "0x000000000000000000000000000000000000dEaD";

let RPCS = {
  'bsc': [
    "https://bsc-dataseed.binance.org",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc-dataseed1.ninicoin.io",
  ],
  // https://t.me/DogeChainOfficial/50830
  // https://docs.dogechain.dog
  // https://explorer.dogechain.dog
  'dog': [ 
    "https://rpc-sg.dogechain.dog",
    "https://rpc-us.dogechain.dog",
    "https://rpc.dogechain.dog",
    "https://rpc01-sg.dogechain.dog",
    "https://rpc02-sg.dogechain.dog",
    "https://rpc03-sg.dogechain.dog",
  ],
};

let PROVIDER;
let CURCHAINID;
if (isBrowser) {
  if (window.ethereum) {
    PROVIDER = new ethers.providers.Web3Provider(window.ethereum);
    (async function () {
      let network = await PROVIDER.getNetwork();
      CURCHAINID = network['chainId'];
    })();
  }
}

if (typeof PROVIDER === 'undefined') { // default chain bsc
  let params = {
    chainId: CHAINIDS['bsc'],
    rpcUrls: RPCS['bsc'],
  };
  PROVIDER = new ethers.providers.JsonRpcProvider(RPCS['bsc'][0], params); // rpc set first
}

const SIGNER = PROVIDER.getSigner();

const IERC20ABIS = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint)",
  "function totalSupply() view returns (uint)",
  "function balanceOf(address) view returns (uint)",
  "function allowance(address, address) view returns (uint)",
  
  "function approve(address, uint) returns (bool)",
  "function transfer(address, uint) returns (bool)",
  
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint value);",
];


function setConts(name, adr, abi) {
  CONTS[name] = new ethers.Contract(adr, abi, PROVIDER);
  SIGNS[name] = CONTS[name].connect(SIGNER);
  INTFS[name] = new ethers.utils.Interface(abi);
}

const CONTS = {};
const SIGNS = {};
const INTFS = {};
for (let name in ABIS) {
  setConts(name, ADRS[name], ABIS[name]);
}


////////////////////////////////////////////////////////////////////////////// busd usdt usdc
ADRS['eth-weth'] = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
ADRS['bsc-weth'] = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
ADRS['dog-weth'] = "0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101";
ABIS['weth'] = IERC20ABIS;
// ADRS['eth-weth'] = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
ADRS['bsc-usdt'] = "0x55d398326f99059fF775485246999027B3197955";
ADRS['dog-usdt'] = "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D";
ABIS['usdt'] = IERC20ABIS;
ADRS['bsc-usdc'] = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
ADRS['dog-usdc'] = "0x765277EebeCA2e31912C9946eAe1021199B39C61";
ABIS['usdc'] = IERC20ABIS;
for (let chainName of CHAINNAMES) {
  for (let name of ['weth', 'usdt', 'usdc']) {
    if (!(`${chainName}-${name}` in ADRS)) {
        continue;
    }  
    setConts(`${chainName}-${name}`, ADRS[`${chainName}-${name}`], ABIS[name]); ///////////////////////////// no need to set all with token setting
  }
}


const DEXS = {};
DEXS['eth'] = ['uni'];
DEXS['bsc'] = ['pcs'];
DEXS['dog'] = ['dog', 'yod', 'qui',];

// ADRS['eth-uni-factory'] = "0x0000000000000000000000000000000000000000"; //////////////////////////////// CHECK
ADRS['bsc-pcs-factory'] = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
ADRS['dog-dog-factory'] = "0xD27D9d61590874Bf9ee2a19b27E265399929C9C3";
ADRS['dog-yod-factory'] = "0xAaA04462e35f3e40D798331657cA015169e005d7";
ADRS['dog-qui-factory'] = "0xd2480162Aa7F02Ead7BF4C127465446150D58452";
ABIS['factory'] = [
  "function getPair(address, address) view returns (address)",
];
for (let chainName of CHAINNAMES) {
  for (let dex of DEXS[chainName]) {
    for (let name of ['factory']) {
      if (!(`${chainName}-${dex}-${name}` in ADRS)) {
        continue;
      }
      setConts(`${chainName}-${dex}-${name}`, ADRS[`${chainName}-${dex}-${name}`], ABIS[name]);
    }
  }
}

// ADRS['eth-uni-router'] = "0x0000000000000000000000000000000000000000"; //////////////////////////////// CHECK
ADRS['bsc-pcs-router'] = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
ADRS['dog-dog-router'] = "0xa4EE06Ce40cb7e8c04E127c1F7D3dFB7F7039C81"; // 0.2%
ADRS['dog-yod-router'] = "0x72d85Ab47fBfc5E7E04a8bcfCa1601D8f8cE1a50"; // 0.5%
ADRS['dog-qui-router'] = "0x4aE2bD0666c76C7f39311b9B3e39b53C8D7C43Ea";
ABIS['router'] = [
  "function getAmountsOut(uint, address[]) view returns (uint[])",
  "function swapExactETHForTokensSupportingFeeOnTransferTokens(uint, address[], address, uint) payable",
  "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint, uint, address[], address, uint)",
];
for (let chainName of CHAINNAMES) {
  for (let dex of DEXS[chainName]) {
    for (let name of ['router']) {
      if (!(`${chainName}-${dex}-${name}` in ADRS)) {
        continue;
      }
      setConts(`${chainName}-${dex}-${name}`, ADRS[`${chainName}-${dex}-${name}`], ABIS[name]);
    }
  }
}



// factory = pair list
// pair list = token list
// hot top pair list    

{
  let pairAdrs = {
    'dog': {
      'dog': [
        ['wwdoge', 'elon', "0x0000000000000000000000000000000000000000"],
        ['wwdoge', 'omnom', "0x0000000000000000000000000000000000000000"],
      ],
    },
  }
  ABIS['pair'] = [
    "function token0() view returns (address)",
    "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  ];
  for (let chainName in pairAdrs) {
    for (let dex in pairAdrs[chainName]) {
      for (let pairSet of pairAdrs[chainName][dex]) {
        let [tokenA, tokenB, adr] = pairSet;
        ADRS[`${chainName}-${dex}-${tokenA}-${tokenB}`] = adr;
        setConts(`${chainName}-${dex}-${tokenA}-${tokenB}`, ADRS[`${chainName}-${dex}-${tokenA}-${tokenB}`], ABIS['pair']);
        ADRS[`${chainName}-${dex}-${tokenB}-${tokenA}`] = adr;
        setConts(`${chainName}-${dex}-${tokenB}-${tokenA}`, ADRS[`${chainName}-${dex}-${tokenB}-${tokenA}`], ABIS['pair']);
      }
    }
  }
}




// our token launch time: 2022.03.22 02:30:03 PM UTC
// https://bscscan.com/tx/0x3745eb92a39460e840aa5503872f7c2fe513f061e8e0e7c59b35fad7841b2896

// v2 launch time: Jul-18-2022 03:00:20 PM +UTC
// https://bscscan.com/tx/0x4eb05c11e733d47e2fe5ca6206ea371c641281200dbebf2012e60cefdc34d441
const STARTBLOCK = 19661447; 

let CURBLOCK;
async function getCurBlock() {
	let curBlock = await PROVIDER.getBlockNumber();
  
  return curBlock;
}
(async () => {
	CURBLOCK = await getCurBlock();
})();


ADRS['owner'] = "0xe7F0704b198585B8777abe859C3126f57eB8C989";
////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////// base web3
const ETHDECI = 18
const ETHDIV = 10**ETHDECI;
function BNB(v, n=4) {
  return ROUND(INT(v) / ETHDIV, n);
}


function BIG(v, decimals=18) {
  try {
    if (decimals == 18) {
      return ethers.utils.parseEther(STR(FLOAT(v)));
    } else {
      return ethers.utils.parseUnits(STR(FLOAT(v)), decimals);
    }
  } catch (e) {
    alert(e);
  }
}
function ETH(big, decimals=18) {
  try {
    if (decimals == 18) {
      return ethers.utils.formatEther(big);
    } else {
      return ethers.utils.formatUnits(big, decimals);
    }
  } catch (e) {
    alert(e);
  }
}


function BSC(type, txt) {
  return `https://bscscan.com/${type}/${txt}`;
}

function ADR(address, popup=true) {
  let checksumAdr;
  try {
    checksumAdr = ethers.utils.getAddress(address);
  } catch (e) {
    let eStr = 'Wrong Format Address: ' + WRAP(address);
    console.log(eStr);
    if (popup) {
      alert(eStr);
    }
    
    return '';
  }
  return checksumAdr;
}

function SHORTADR(adr, x=true, n=4) {
  let shortAdr = '';
  if (x) {
    shortAdr += adr.slice(0, 2);
  }
  shortAdr += adr.slice(2, 2 + n) + '..' + adr.slice(-n);
  return shortAdr;
}



///////////////////////////////// onchain
async function getBalance(adr) {
	let balance = await PROVIDER.getBalance(adr);
 
  return balance;
}

async function getR(token, base, dex=null) {
  if (dex == null) {
    dex = DEXS[CURCHAIN][0];
  }
  let r = await CONTS[`${CURCHAIN}-${dex}-${token}-${base}`].getReserves();
  r = [r[0], r[1]];
  let t0 = await CONTS[`${CURCHAIN}-${dex}-${token}-${base}`].token0();
  
  if (t0 != ADRS[`${CURCHAIN}-${dex}-${token}`]) { // token not t0
    r = [r[1], r[0]]; // base/token so reverse to token/base
  }
  return r;
}

let CURADR = null;
async function getCurAdr() {
	try {
  	CURADR = await SIGNER.getAddress();
  } catch (err) {
  	console.log('not connected yet');
    CURADR = null;
  }
}


async function runFirst() {
}

async function runGlobal() { // dummy
}

async function runAnon() { // dummy
}

async function runPersonal() { // dummy
}

let popupSettings = {
  placement: 'bottom',
  boundary: 'window',
};
async function runLast() {
  $(document).ready(function() {
    $('[data-bs-toggle="tooltip"]').tooltip(popupSettings);
    $('[data-bs-toggle="tooltip"]').on('shown.bs.tooltip', function () {
      // MathJax.Hub.Queue(
      //   ["Typeset",MathJax.Hub,document],
      //   function () {                
      //     $("#thingToHaveMathJaxToolTip").attr("title",$("#toolTipText").html());
      //   ]
      // );
    });
  });
}

function displayAccountInformation() {
  let shortAdrStr = SHORTADR(CURADR);
  
  displayText('.connect-wallet', shortAdrStr);
	
  getBalance(CURADR).then((res) => {
    displayText('.balance', BNB(res, 3));
  });

  return;
}

async function handleAccountsChanged(accounts) {
  if (accounts.length == 0) {
    displayText("connectResult", 'Please Connect Metamask');
    return;
  }
  
  if (accounts.length == 0) {
    console.log('no account');
    CURADR = null;
    return;
  }
  CURADR = ADR(accounts[0]);
  displayAccountInformation();
}

async function conn(func=null, popup=false) {
	try {
  	/* CURADR = await PROVIDER.send("eth_requestAccounts", []) */;
    let accounts = await ethereum.request({ method: 'eth_requestAccounts' }); // eth_requestAccounts
    await handleAccountsChanged(accounts);
    await runPersonal();
    if (func != null) {
      await func();
    }
    
  } catch (err) {
    if (err == 'ReferenceError: ethereum is not defined') {
      alert('Use Dapp to connect wallet!');
      return;
    }
    
    console.log(err);
    if ('message' in err) {
      err = err['message'];
    }
  	
    if (popup) {
    	alert(JSON.stringify(err));
    }    
  }
}

function handleChainChanged(_chainId) {
  // Reload the page
  window.location.reload();
}

(async () => {
  if (isBrowser) {
    if (window.ethereum) {
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);
    }
  }
})();


////////////////////////////////////////////////// tx
async function ERR(err, popup=true) {
  let result = err;

  if (!('code' in err)) {
    alert('no code:' + err);
    return result;
  }

  if (err['code'] == -32603) {
    if (!('data' in err)) {
      alert('no data:' + err);
      return result;
    }

    let data = err['data'];
    if (!('code' in data)) {
      alert('no code data:', err);

      return result;
    }

    if (data['code'] == 3) {
      let msg = data['message'];
      result = msg;
      alert('C:' + result);
      return result;
    }

    if (data['code'] == -32000) {
      let msg = data['message'];
      result = msg;
      alert('D:' + result);
      return result;
    }
  }

  return result;
}

async function SIGN(name, msg, bin=false) {
	if (bin == true) {
  	msg = ethers.utils.arrayify(msg);
  }
  return await SIGNS[name].signMessage(msg);
}


async function SEND_ETH(from, to=ADRS['owner'], value='0.0', popup=true) {
	const data = {
  	from: from,
  	to: to,
    value: BIG(value),
    // nonce: window.ethersProvider.getTransactionCount(send_account, "latest"),
    // gasLimit: ethers.utils.hexlify(gas_limit), // 100000
    // gasPrice: gas_price,
  };
  
  try {
  	let result = await SIGNER.sendTransaction(data);
    console.log('result', result);
    return [ false, result ];
  } catch (err) {
  	err = await ERR(err, popup);
    return [ true, err ];
  }
}

async function getOverrides(overrides) {
  if (overrides == null) {
    overrides = {};
    overrides['gasLimit'] = 5 * 10**6;
    if (CURADR == null) {
      overrides['from'] = ADRS['owner'];
    } else {
      overrides['from'] = CURADR;
    }
  }
  
  return overrides;
}

async function READ_TX(name, method, args, popup=true, overrides=null) {
  overrides = await getOverrides(overrides);
  
  try {
  	let result = await CONTS[name][method](...args, overrides);
    return [ false, result ];
  } catch (err) {
  	err = await ERR(err, popup);
    return [ true, err ];
  }
 
}



async function READ_TX_(adr, name, method, params, suffixs, args) {
  ADRS[name] = adr;
  if (!(name in ABIS)) {
    ABIS[name] = [];
  }

  if (name in CONTS) {
    if (!(method in CONTS[name])) {
      let abiStr = `function ${method}${params} ${suffixs}`;
      ABIS[name].push(abiStr);
    }
  }
  
  setConts(name, ADRS[name], ABIS[name]);
  
  let [res, data] = await READ_TX(name, method, args);
  return [res, data];
}


async function GAS(name, method, args, value=null, popup=true, overrides=null) {
  overrides = await getOverrides(overrides);
  
  if (value != null) {
    overrides['value'] = BIG(value);
  }
  
  let result;
  try {
    result = await CONTS[name].estimateGas[method](...args, overrides);
    console.log('result', result);
    return [ false, result ];
  } catch (err) {
    result = await ERR(err, popup);
    return [ true, result ];
  };
}


async function SEND_TX(name, method, args, value=null, check=true, popup=true, overrides=null) {
  overrides = await getOverrides(overrides);

  if (value != null) {
    overrides['value'] = BIG(value);
  }

  if (check) {
    let [res, data] = await GAS(name, method, args, value, popup, overrides);
    if (res) {
      console.log(data);
      return [ true, data ];
    } 

    // use gas result
    console.log('gas', res, INT(data));
    overrides['gasLimit'] = INT(data * 1.3);
  }

  try {
    let result;
    result = await SIGNS[name][method](...args, overrides);
    console.log('hash', result['hash']);
    console.log('result', result);
    return [ false, result ];

    // if (wait == true) {
    //   let txResult = await result.wait();
    //   console.log('txResult', txResult);
    //   return [ false, txResult ];
    //   // event, eventSignature
    // } else {
    	
    // }
    /* console.log(tx.hash); */
    // wait()
    // receipt.events
  } catch (err) {
    err = await ERR(err, popup);
    return [ true, err ];
  }
}

async function WAIT_TX(result) {
  let txResult = await result.wait();
  console.log('txResult', txResult);
  
  return [ false, txResult ]; // event, eventSignature
}


///////////////////////////////////// cache

let F = {};
let V = [];
let P = {};
let VIdx = 0;
async function gV(k) {
  if (!(k in V[VIdx])) {
    if (!(k in F)) {
      alert(k);
      return [true, null];
    }

    if (!(k in P)) {
      P[k] = null;  
    }

    V[VIdx][k] = await F[k](P[k]);
  }

  return V[VIdx][k];  
}


///////////////////////////////// html

const BNBICONURL = "images/bnb-icon.png";
const BUSDICONURL = "images/busd.png";
const TOKENICONURL = "images/logos/TWEP/TWEP.png";

function HREF(link, txt) {
	return `<a href="${link}">${txt}</a>`;
}

function IMG(src) {
	return `<img src="${src}" style="width: 100%;">`;
}

function makeElem(elemType, elemId = null, elemClass = null) {
  let elem = document.createElement(elemType);
  if (elemId) {
    elem.setAttribute('id', elemId);
  }
  if (elemClass) {
    elem.setAttribute('class', elemClass);
  }

  return elem;
}

if (isBrowser) {
  let nullDiv = makeElem('div', 'NULL', null);
  nullDiv.style.width = '1px';
  nullDiv.style.display = 'none';
  document.body.append(nullDiv);
}

function select(el, all=false) {
  el = el.trim();
  let elms = [...document.querySelectorAll(el)];
  if (elms.length == 0) {
    elms = [document.querySelector('#NULL')]; // how to erase inner?
  }

  if (all) {  
    return elms;
  }

  return elms[0];
}

function isExist(el) {
  let els = select(el, true);
  if (els == null) {
    return null;
  }

  if (els.id == 'NULL') {
    return null;
  }

  return els;
}

function displayText(el, text) {
  let els = isExist(el);
  if (els == null) {
    return;
  }
  
  for (var idx = 0; idx < els.length; idx++) {
    els[idx].innerHTML = text;
  }
}

function setClass(target, cls, on=true) {
  if (on) {
    select(target).classList.add(cls);
  } else {
    select(target).classList.remove(cls);
  }
}

function toggleClass(target, cls) {
  if (cls in select(target).classList) {
    setClass(target, cls, false);
  } else {
    setClass(target, cls, true);
  }
}

async function getUrlData(url) {
  let v = await fetch(url);
  v = await v.json();
  return v;
}


///////////////////// cookie
function setCookie(name, value, expDays) {
  let date = new Date();
  date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + "; " + expires + "; path=/";
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}


/////////////////////////////// copy
function copy(value) {
  const input = document.createElement('textarea');
  input.value = value;
	document.body.appendChild(input);

  var isiOSDevice = navigator.userAgent.match(/ipad|iphone/i);

  if (isiOSDevice) {

    var editable = input.contentEditable;
    var readOnly = input.readOnly;

    input.contentEditable = true;
    input.readOnly = false;

    var range = document.createRange();
    range.selectNodeContents(input);

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    input.setSelectionRange(0, 999999);
    input.contentEditable = editable;
    input.readOnly = readOnly;

  } else {
    // document.body.appendChild(input);
    input.select();

  }

  document.execCommand('copy');
  //if (!isiOSDevice) {
    document.body.removeChild(input);
  //}
}


///////////////////////////// comma
function swapComma(id, isOn) {
  var $input = $( "#" + id );
  
  if (isOn == false) {
    $input.off("keyup");
    return;
  } 
  
  $input.on( "keyup", function( event ) {
   
      // 1.
      var selection = window.getSelection().toString();
      if ( selection !== '' ) {
          return;
      }
   
      // 2.
      if ( $.inArray( event.keyCode, [38,40,37,39] ) !== -1 ) {
          return;
      }
    
      // 3
      var $this = $( this );
      var input = $this.val();
   
      // 4
      var input = input.replace(/[\D\s\._\-]+/g, "");
   
      // 5
      input = input ? parseInt( input, 10 ) : 0;
   
      // 6
      $this.val( function() {
          return ( input === 0 ) ? "" : input.toLocaleString( "en-US" );
      });

  } );
}




///////////////////////////////////////////////// time
function getTimeStr(t, d=true, h=true, m=true, s=true) {
  let ds = INT((t % (60*60*24*365)) / (60*60*24));
  let hs = INT((t % (60*60*24)) / (60*60));
  let ms = INT((t % (60*60)) / (60));
  let ss = INT((t % (60)) / (1));
  
  let timeStr = '';
  if (d) {
    timeStr += ` ${ds}d`;
  }
  if (h) {
    timeStr += ` ${hs}h`;
  }
  if (m) {
    timeStr += ` ${ms}m`;
  }
  if (s) {
    timeStr += ` ${ss}s`;
  }
  return timeStr;
}


function setSpin(target, on) {
  let elm = select(target + ' button');
  if (on) {
    elm.innerHTML = '<span class="spinner"></span>' + elm.innerHTML; // irreversible
    elm.classList.add('spin');
  } else {
    elm.classList.remove('spin');
  }
}




async function changeNetwork(name) {
  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{
      chainId: CHAINIDS[name],
      rpcUrls: RPCS[name],
    }],
  });
}







// ////////////////////////////////////////////////////////////// scratch
// function distanceBetween(point1, point2) {
//   return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
// }

// function angleBetween(point1, point2) {
//   return Math.atan2( point2.x - point1.x, point2.y - point1.y );
// }

// // Only test every `stride` pixel. `stride`x faster,
// // but might lead to inaccuracy
// function getFilledInPixels(stride) {
//   if (!stride || stride < 1) { stride = 1; }
  
//   var pixels   = ctx.getImageData(0, 0, canvas.width, canvas.height),
//       pdata    = pixels.data,
//       l        = pdata.length,
//       total    = (l / stride),
//       count    = 0;
  
//   // Iterate over all pixels
//   for(var i = count = 0; i < l; i += stride) {
//     if (parseInt(pdata[i]) === 0) {
//       count++;
//     }
//   }
  
//   return Math.round((count / total) * 100);
// }

// function getMouse(e, canvas) {
//   var offsetX = 0, offsetY = 0, mx, my;

//   if (canvas.offsetParent !== undefined) {
//     do {
//       offsetX += canvas.offsetLeft;
//       offsetY += canvas.offsetTop;
//     } while ((canvas = canvas.offsetParent));
//   }

//   mx = (e.pageX || e.touches[0].clientX) - offsetX;
//   my = (e.pageY || e.touches[0].clientY) - offsetY;

//   return {x: mx, y: my};
// }

// let isDrawing = false;
// let lastPoint;
// function handleMouseDown(e) {
//   isDrawing = true;
//   lastPoint = getMouse(e, canvas);
// }

// function handleMouseMove(e) {
//   if (!isDrawing) { return; }
  
//   e.preventDefault();

//   var currentPoint = getMouse(e, canvas),
//       dist = distanceBetween(lastPoint, currentPoint),
//       angle = angleBetween(lastPoint, currentPoint),
//       x, y;
  
//   for (var i = 0; i < dist; i++) {
//     x = lastPoint.x + (Math.sin(angle) * i) - 25;
//     y = lastPoint.y + (Math.cos(angle) * i) - 25;
//     ctx.globalCompositeOperation = 'destination-out';
//     ctx.drawImage(brush, x, y);
//   }
  
//   lastPoint = currentPoint;
//   handlePercentage(getFilledInPixels(32));
// }

// function handleMouseUp(e) {
//   isDrawing = false;
// }
// //////////////////////////////////////////////////////////////




console.log('base done');








