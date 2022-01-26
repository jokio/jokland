import { Location } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import detectEthereumProvider from '@metamask/detect-provider'
import MetamaskOnboarding from '@metamask/onboarding'
import { ethers } from 'ethers'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  selectedTab = 'avatar'

  chains = new Map([
    ['0x1', 'Mainnet'],
    ['0x3', 'Ropsten'],
    ['0x4', 'Rinkeby'],
    ['0x5', 'Goerli'],
    ['0x2a', 'Kovan'],
  ])

  hideSeparatorLine = true
  isConnectEnabled = false
  userENS = ''
  userAddress = ''
  userDisplayAddress = ''
  userBalance = ''

  onboarding = new MetamaskOnboarding()

  chainId = ''
  chainName = ''

  constructor(private location: Location) {}

  ngOnInit() {
    const path = this.location.path(false)

    const userAddress = localStorage.getItem('jok.address') ?? ''

    this.loadAccount(userAddress)

    switch (path) {
      case '/packs':
        this.selectedTab = 'packs'
        break

      case '/roadmap':
        this.selectedTab = 'roadmap'
        break

      case '/games':
        this.selectedTab = 'games'
        break
    }

    this.initializeWallet()
  }

  onTabChange(e: any) {
    this.selectedTab = e.detail.value
  }

  onScroll(e: any) {
    this.hideSeparatorLine = e.detail.currentY === 0
  }

  async connect() {
    if (!this.isConnectEnabled) {
      this.onboarding.startOnboarding()
      return
    }

    this.onboarding.stopOnboarding()

    const accounts = await (window as any).ethereum.request({
      method: 'eth_requestAccounts',
    })
    const account = accounts[0]

    await this.loadAccount(account)
  }

  async selectAddress() {
    const permissions = await (window as any).ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    })

    console.log('permissions', permissions)
  }

  async loadAccount(account: string) {
    localStorage.setItem('jok.address', account)
    this.userAddress = account
    this.userDisplayAddress = this.minimizeAddress(account)
    this.userBalance = '⏳'
    this.userENS = ''

    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum,
    )

    const result = await provider.lookupAddress(account)
    if (result) {
      this.userENS = result
    }

    const balance = await provider.getBalance(account)
    const formattedBalance = ethers.utils.formatEther(balance)
    const decimalsIndex = formattedBalance.indexOf('.')

    this.userBalance = formattedBalance.slice(0, decimalsIndex + 5)

    // const provider = new ethers.providers.Web3Provider(
    //   (window as any).ethereum,
    // )

    // // The MetaMask plugin also allows signing transactions to
    // // send ether and pay to change state within the blockchain.
    // // For this, you need the account signer...
    // const signer = provider.getSigner()
    // const address = await signer.getAddress()
  }

  async initializeWallet() {
    const provider: any = await detectEthereumProvider({
      mustBeMetaMask: true,
    })

    if (provider) {
      console.log('Ethereum successfully detected!')

      // From now on, this should always be true:
      // provider === window.ethereum

      // Access the decentralized web!

      // Legacy providers may only have ethereum.sendAsync
      this.chainId = await provider.request({
        method: 'eth_chainId',
      })
      this.chainName = this.chains.get(this.chainId) ?? 'Unknown'

      this.isConnectEnabled = true
      ;(window as any).ethereum.on(
        'accountsChanged',
        (accounts: string[]) => {
          console.log('accountsChanged', accounts)
          this.loadAccount(accounts[0])
        },
      )
      ;(window as any).ethereum.on(
        'chainChanged',
        (chainId: string) => {
          this.chainId = chainId
          this.chainName = this.chains.get(this.chainId) ?? 'Unknown'
          console.log('chainId', chainId)
          this.loadAccount(this.userAddress)
        },
      )
    } else {
      // if the provider is not detected, detectEthereumProvider resolves to null
      console.error('Please install MetaMask!')
    }
  }

  openAbout() {}

  private minimizeAddress(account: string) {
    const address = ethers.utils.getAddress(account)

    if (address.length < 42) {
      return account
    }

    const items = account.split('')

    const finalItems = items
      .slice(0, 6)
      .concat(['.', '.', '.'])
      .concat(items.slice(38))
      .map((x, i) => (i === 1 ? x : x.toUpperCase()))

    return finalItems.join('')
  }
}
