package com.example.emberandplate.data.models

import kotlinx.serialization.Serializable

@Serializable
data class RestaurantInfo(
    val name: String,
    val tagline: String? = null,
    val currency: String = "INR",
    val taxRate: Double = 5.0
)

@Serializable
data class TableInfo(
    val id: String,
    val tableNumber: String,
    val qrToken: String,
    val capacity: Int,
    val status: String
)

@Serializable
data class TableResponse(
    val table: TableInfo,
    val restaurant: RestaurantInfo
)

@Serializable
data class MenuItemAddon(
    val id: String,
    val menuItemId: String? = null,
    val name: String,
    val price: Double
)

@Serializable
data class MenuItem(
    val id: String,
    val categoryId: String,
    val name: String,
    val description: String,
    val price: Double,
    val imageUrl: String,
    val isVeg: Boolean = true,
    val isPopular: Boolean = false,
    val isAvailable: Boolean = true,
    val prepTimeMinutes: Int = 15,
    val addons: List<MenuItemAddon> = emptyList()
)

@Serializable
data class MenuCategory(
    val id: String,
    val name: String,
    val slug: String,
    val displayOrder: Int = 0,
    val isActive: Boolean = true,
    val items: List<MenuItem> = emptyList()
)

@Serializable
data class MenuResponse(
    val categories: List<MenuCategory>,
    val totalItems: Int,
    val popularItems: List<MenuItem> = emptyList()
)

@Serializable
data class OrderItemPayload(
    val menuItemId: String,
    val quantity: Int,
    val addonIds: List<String> = emptyList()
)

@Serializable
data class CreateOrderRequest(
    val table_token: String,
    val items: List<OrderItemPayload>,
    val customerNotes: String? = null
)

@Serializable
data class OrderSummary(
    val id: String,
    val orderNumber: String,
    val tableNumber: String,
    val status: String,
    val totalAmount: Double,
    val trackingToken: String,
    val prepTimeMinutes: Int = 15,
    val createdAt: String? = null,
    val itemsCount: Int = 0
)

@Serializable
data class CreateOrderResponse(
    val success: Boolean,
    val order: OrderSummary
)

@Serializable
data class TrackOrderItem(
    val id: String,
    val name: String,
    val imageUrl: String,
    val isVeg: Boolean,
    val quantity: Int,
    val unitPrice: Double,
    val addons: List<MenuItemAddon> = emptyList(),
    val subtotal: Double
)

@Serializable
data class TrackOrderDetail(
    val id: String,
    val orderNumber: String,
    val tableNumber: String,
    val status: String,
    val totalAmount: Double,
    val customerNotes: String? = null,
    val createdAt: String,
    val updatedAt: String? = null,
    val prepTimeMinutes: Int = 15,
    val items: List<TrackOrderItem> = emptyList()
)

@Serializable
data class TrackOrderResponse(
    val order: TrackOrderDetail
)
