package com.example.emberandplate.data

import com.example.emberandplate.data.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.roundToInt

data class MobileCartItem(
    val id: String,
    val item: MenuItem,
    val quantity: Int,
    val selectedAddons: List<MenuItemAddon>,
    val unitPrice: Double,
    val lineTotal: Double
)

object CartManager {
    private val _currentTable = MutableStateFlow<TableInfo?>(null)
    val currentTable: StateFlow<TableInfo?> = _currentTable.asStateFlow()

    private val _restaurantInfo = MutableStateFlow<RestaurantInfo?>(null)
    val restaurantInfo: StateFlow<RestaurantInfo?> = _restaurantInfo.asStateFlow()

    private val _cartItems = MutableStateFlow<List<MobileCartItem>>(emptyList())
    val cartItems: StateFlow<List<MobileCartItem>> = _cartItems.asStateFlow()

    private val _customerNotes = MutableStateFlow("")
    val customerNotes: StateFlow<String> = _customerNotes.asStateFlow()

    private val _activeOrder = MutableStateFlow<OrderSummary?>(null)
    val activeOrder: StateFlow<OrderSummary?> = _activeOrder.asStateFlow()

    fun setTableSession(table: TableInfo, restaurant: RestaurantInfo) {
        _currentTable.value = table
        _restaurantInfo.value = restaurant
    }

    fun clearTableSession() {
        _currentTable.value = null
        _restaurantInfo.value = null
        clearCart()
    }

    fun addToCart(item: MenuItem, quantity: Int, addons: List<MenuItemAddon>) {
        val addonKey = addons.map { it.id }.sorted().joinToString("-")
        val compositeId = "${item.id}_$addonKey"

        val addonsCost = addons.sumOf { it.price }
        val unitPrice = item.price + addonsCost

        val currentList = _cartItems.value.toMutableList()
        val existingIndex = currentList.indexOfFirst { it.id == compositeId }

        if (existingIndex >= 0) {
            val existing = currentList[existingIndex]
            val newQty = existing.quantity + quantity
            currentList[existingIndex] = existing.copy(
                quantity = newQty,
                lineTotal = newQty * unitPrice
            )
        } else {
            currentList.add(
                MobileCartItem(
                    id = compositeId,
                    item = item,
                    quantity = quantity,
                    selectedAddons = addons,
                    unitPrice = unitPrice,
                    lineTotal = quantity * unitPrice
                )
            )
        }

        _cartItems.value = currentList
    }

    fun updateQuantity(cartItemId: String, newQty: Int) {
        if (newQty <= 0) {
            removeFromCart(cartItemId)
            return
        }
        val currentList = _cartItems.value.map {
            if (it.id == cartItemId) {
                it.copy(quantity = newQty, lineTotal = newQty * it.unitPrice)
            } else it
        }
        _cartItems.value = currentList
    }

    fun removeFromCart(cartItemId: String) {
        _cartItems.value = _cartItems.value.filter { it.id != cartItemId }
    }

    fun setNotes(notes: String) {
        _customerNotes.value = notes
    }

    fun clearCart() {
        _cartItems.value = emptyList()
        _customerNotes.value = ""
    }

    fun setActiveOrder(order: OrderSummary?) {
        _activeOrder.value = order
    }

    val totalItemsCount: Int
        get() = _cartItems.value.sumOf { it.quantity }

    val subtotal: Double
        get() = _cartItems.value.sumOf { it.lineTotal }

    val taxAmount: Double
        get() = (subtotal * 0.05 * 100).roundToInt() / 100.0

    val grandTotal: Double
        get() = subtotal + taxAmount
}
