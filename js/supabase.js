import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

// Get the Supabase URL and anon key from environment variables
const supabaseUrl = 'https://xyzcompany.supabase.co';  // Replace with your Supabase project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';  // Replace with your Supabase anon key

// Create Supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    global: {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    }
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.email)
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
    }
})

/**
 * Sign up a new user
 * @param {string} email 
 * @param {string} password 
 * @param {string} fullName 
 */
export async function signUpUser(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        })

        if (error) throw error

        // Wait for session to be established
        if (data.user) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        return {
            user: data.user,
            error: null
        }
    } catch (error) {
        console.error('Sign up error:', error.message)
        return {
            user: null,
            error
        }
    }
}

/**
 * Sign in an existing user
 * @param {string} email 
 * @param {string} password 
 */
export async function signInUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw error

        // Wait for session to be established
        if (data.user) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        return {
            user: data.user,
            error: null
        }
    } catch (error) {
        console.error('Sign in error:', error.message)
        return {
            user: null,
            error
        }
    }
}

/**
 * Sign out the current user
 */
export async function signOutUser() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Sign out error:', error.message)
        return { error }
    }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error

        if (!session) {
            return { user: null, error: null }
        }

        return { user: session.user, error: null }
    } catch (error) {
        console.error('Get current user error:', error.message)
        return { user: null, error }
    }
}

/**
 * Get user profile data
 * @param {string} userId 
 */
export async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) throw error

        return {
            profile: data,
            error: null
        }
    } catch (error) {
        console.error('Get user profile error:', error.message)
        return {
            profile: null,
            error
        }
    }
}

export const products = {
    async getAll() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
        return { data, error }
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single()
        return { data, error }
    }
}

export const cart = {
    async getCart(userId) {
        const { data, error } = await supabase
            .from('cart')
            .select('*')
            .eq('user_id', userId)
        return { data, error }
    },

    async addToCart(userId, productId, size, quantity) {
        const { data, error } = await supabase
            .from('cart')
            .upsert({
                user_id: userId,
                product_id: productId,
                size,
                quantity
            })
        return { data, error }
    },

    async updateQuantity(userId, productId, size, quantity) {
        const { data, error } = await supabase
            .from('cart')
            .update({ quantity })
            .eq('user_id', userId)
            .eq('product_id', productId)
            .eq('size', size)
        return { data, error }
    },

    async removeFromCart(userId, productId, size) {
        const { data, error } = await supabase
            .from('cart')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId)
            .eq('size', size)
        return { data, error }
    }
}

export const orders = {
    async createOrder(userId, items, shippingInfo) {
        const { data, error } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                items,
                shipping_info: shippingInfo,
                status: 'pending'
            })
        return { data, error }
    },

    async getOrders(userId) {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
        return { data, error }
    }
} 