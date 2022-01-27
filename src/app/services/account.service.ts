import { Injectable } from '@angular/core'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from 'ethers'
import { Subject } from 'rxjs'

@Injectable()
export class AccountService {
  userENS = ''
  userAddress = ''
  userDisplayAddress = ''
  userBalance = ''

  chainId = ''
  chainName = ''

  isConnectEnabled = false

  activeAccountUpdate$ = new Subject<string>()

  get isWalletConnected() {
    return !!localStorage.getItem('jok.address')
  }

  avatarImage = ''

  private chains = new Map([
    ['0x1', 'Mainnet'],
    ['0x3', 'Ropsten'],
    ['0x4', 'Rinkeby'],
    ['0x5', 'Goerli'],
    ['0x2a', 'Kovan'],
    ['0x89', 'Polygon'],
  ])

  async selectAddress() {
    await (window as any).ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    })
  }

  signOut() {
    this.userAddress = ''
    this.userDisplayAddress = ''
    this.userBalance = ''
    this.userENS = ''

    localStorage.removeItem('jok.address')
  }

  async loadAccount(account: string) {
    if (!account) {
      this.signOut()
      return
    }

    localStorage.setItem('jok.address', account)
    this.userAddress = ethers.utils.getAddress(account)
    this.userDisplayAddress = this.minimizeAddress(account)
    this.userBalance = ''
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

    this.activeAccountUpdate$.next(this.userAddress)
  }

  async initializeWallet() {
    const userAddress = localStorage.getItem('jok.address') ?? ''
    if (userAddress === 'undefined') {
      localStorage.removeItem('jok.address')
    } else {
      await this.loadAccount(userAddress)
    }

    const provider: any = await detectEthereumProvider({
      mustBeMetaMask: true,
    })

    if (provider) {
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

  minimizeAddress(address: string) {
    if (address.length < 42) {
      return address
    }

    const items = address.split('')

    const finalItems = items
      .slice(0, 6)
      .concat(['.', '.', '.'])
      .concat(items.slice(38))
      .map((x, i) => (i === 1 ? x : x.toUpperCase()))

    return finalItems.join('')
  }
}
