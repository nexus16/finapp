import axios from 'axios'
import { addCategory, getCategories } from '../../api/api'
import { CATEGORIES_URL } from '../../constants'
import orderBy from 'lodash/orderBy'

const store = {
  state: {
    all: []
  },

  getters: {
    categories(state) {
      return state.all
    }
  },

  actions: {
    async getCategories({ commit }) {
      const categories = await getCategories()
      const formatedCategories = categories.map(cat => {
        const id = +cat.id
        const name = cat.name
        const parentId = +cat.parentId
        const description = cat.description
        return {
          id,
          name,
          parentId,
          description
        }
      })
      commit('getCategories', formatedCategories)
    },

    async addCategory({ commit }, category) {
      console.log('category:', category)

      if (!category.name) {
        console.error('No category name')
        return false
      }

      try {
        const formatedCategory = {
          name: category.name,
          parentId: category.parentId ? category.parentId : 0
        }
        const postData = await axios.post(`${CATEGORIES_URL}`, formatedCategory)
        console.log('post:', postData)
        console.log('post.data:', postData.data)

        if (postData.data > 0) {
          const getCategory = await axios.get(`${CATEGORIES_URL}/${postData.data}`, {
            params: { transform: 1 }
          })
          console.log('getCategory.data:', getCategory.data)

          if (getCategory.data) {
            commit('addCategory', getCategory.data)
            return true
          } else {
            console.error('getCategory.data')
            return false
          }
        } else {
          console.error('postData.data')
          return false
        }
      } catch (error) {
        console.error(error)
        return false
      }
    },

    // update
    async updateCategory({ commit, dispatch }, category) {
      try {
        console.log(category)
        const postData = await axios.put(`${CATEGORIES_URL}/${category.id}`, category)
        console.log('post:', postData)
        console.log('post.number:', postData.data)

        if (postData.data === 1) {
          const getCategory = await axios.get(`${CATEGORIES_URL}/${category.id}`, {
            params: { transform: 1 }
          })
          console.log('getCategory.data:', getCategory.data)

          if (getCategory.data) {
            commit('updateCategory', getCategory.data)
            return true
          } else {
            console.error('updateCategory.data')
            return false
          }
        } else {
          console.error('postData.data')
          return false
        }
      } catch (error) {
        console.error(error)
        return false
      }
    },

    async deleteCategory({ commit, dispatch }, id) {
      console.log('id:', id)
      const request = await axios.delete(`${CATEGORIES_URL}/${id}`)
      console.log('delete:', request)
      console.log('delete.data:', request.data)

      const result = request.data
      if (result === 1) {
        console.log('Ok!')
        commit('deleteCategory', id)
        return true
      } else {
        console.error('Not ok')
        return false
      }
    }
  },

  mutations: {
    getCategories(state, data) {
      state.all = data
    },

    addCategory(state, category) {
      const categories = [category, ...state.all]
      const sortedCategories = orderBy(categories, ['name'], ['asc'])
      state.all = sortedCategories
    },

    updateCategory(state, category) {
      const categories = [category, ...state.all.filter(c => c.id !== category.id)]
      const sortedCategories = orderBy(categories, ['name'], ['asc'])
      state.all = sortedCategories
    },

    deleteCategory(state, id) {
      state.all = state.all.filter(c => c.id !== id)
    }
  }
}

export default store
