import View from './components/view'
import Link from './components/link'

export let _Vue

export function install (Vue) {
  /**
    Vue.use(vueRouter) 执行流程
    
    1： 先添加一个混合函数beforeCreate, 在生命周期beoreCreate执行，如果是第一次执行，就会对_router进行赋值
    1-1： _router就是new VueRouter({.....})的实例
    1-2: 为_route定义响应式属性，值为this._router.history.current
    1-3: 执行registerInstance方法，为什么执行这个方法有点不太懂

    2： 添加destroyed生命周期，该生命周期也是执行registerInstance

    3: 为Vue.prototype添加一个$router属性，该值只会返回this._routerRoot._router
    3-1： 为Vue.prototype添加一个.$route属性，该值只会返回this._routerRoot._route
    
    4: 分别添加全局组件router-view, router-link
    
    5：在beforeCreate生命周期定义了用defineReactive函数添加响应式属性_route
    5-1：在router-view的render函数那里触发了get函数const route = parent.$route;
    搜集到了该渲染watch,每次路由发生改变的时候，就会执行router-view的render函数
    
  */

  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)

        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
