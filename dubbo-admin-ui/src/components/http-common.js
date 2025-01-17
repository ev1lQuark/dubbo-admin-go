/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import axios from 'axios'
import Vue from 'vue'
import HttpStatus from 'http-status'
import router from '@/router'
import i18n from '@/lang'

const instance = axios.create({
  // baseURL: '/mock'  // 本地mock接口
  baseURL: '/api/dev'
})

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

instance.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error.message.indexOf('Network Error') >= 0) {
    Vue.prototype.$notify.error('Network error, please check your network settings!')
  } else if (error.response.status === HttpStatus.UNAUTHORIZED) {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    Vue.prototype.$notify.error(i18n.t('authFailed'))
    const paths = location.href.split('#')
    if (paths.length > 1 && paths[1].startsWith('/login')) {
      // avoid splicing multiple redirects
      return
    }
    router.push({ path: '/login', query: { redirect: paths.length === 1 ? '/' : paths[1] } })
  } else if (error.response.status >= HttpStatus.BAD_REQUEST) {
    Vue.prototype.$notify.error(error.response.data.message)
  }
})

export const AXIOS = instance
