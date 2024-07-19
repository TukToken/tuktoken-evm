# TukToken EVM

## TUK token
The token of eTukTuk.io

## Vesting
Vesting contract which has lock period, cliff period and vesting period
```
Ex; 6 months lock, monthly vest over 6 years
tgePercent = 0, lockDuration = 6 month(in sec), cliffDuration = 0 month(in sec), vestingDuration = 6 year(in sec)
Ex; 10% TGE, 2 month cliff, 4 month vesting
tgePercent = 10, lockDuration = 0 month(in sec), cliffDuration = 2 month(in sec), vestingDuration = 4 month(in sec)
```

## Run Tests
```
npx hardhat test
```

## Deploy contract
```
npx hardhat run scripts/deploy.js --network <Network>

Deployed to (testnet):
TUK token - https://testnet.bscscan.com/token/0xA1AAae2751097aB6a823bd663Ff13eb51A94c479
Vesting - https://testnet.bscscan.com/address/0x11eFD188478dEEdB9F829407E8c9113578F40346
```

## Verify Contract

```
npx hardhat verify --network <Network> <Address>
```
