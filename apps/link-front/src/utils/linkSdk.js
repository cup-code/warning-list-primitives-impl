import linkSdk from 'link-sdk/lib/index'
import Vue from 'vue'
// import {clsx} from 'clsx'
// import { twMerge } from 'tailwind-merge'

Object.keys(linkSdk).forEach((key) => {
  Vue.prototype[`$${key}`] = linkSdk[key]
})
