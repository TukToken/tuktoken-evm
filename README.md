# TukToken EVM

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