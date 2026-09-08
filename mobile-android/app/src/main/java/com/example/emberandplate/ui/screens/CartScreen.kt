package com.example.emberandplate.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.emberandplate.data.CartManager
import com.example.emberandplate.data.api.ApiClient
import com.example.emberandplate.data.models.CreateOrderRequest
import com.example.emberandplate.data.models.OrderItemPayload
import com.example.emberandplate.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    onNavigateBack: () -> Unit,
    onOrderPlaced: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val currentTable by CartManager.currentTable.collectAsState()
    val cartItems by CartManager.cartItems.collectAsState()
    val customerNotes by CartManager.customerNotes.collectAsState()

    var isSubmitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val subtotal = CartManager.subtotal
    val tax = CartManager.taxAmount
    val total = CartManager.grandTotal

    fun placeOrder() {
        val table = currentTable
        if (table == null) {
            errorMessage = "No active table session found."
            return
        }

        if (cartItems.isEmpty()) {
            errorMessage = "Your cart is empty."
            return
        }

        coroutineScope.launch {
            isSubmitting = true
            errorMessage = null
            try {
                val payload = CreateOrderRequest(
                    table_token = table.qrToken,
                    customerNotes = customerNotes.ifBlank { null },
                    items = cartItems.map { cartItem ->
                        OrderItemPayload(
                            menuItemId = cartItem.item.id,
                            quantity = cartItem.quantity,
                            addonIds = cartItem.selectedAddons.map { it.id }
                        )
                    }
                )

                val res = ApiClient.service.createOrder(payload)
                if (res.success) {
                    CartManager.setActiveOrder(res.order)
                    CartManager.clearCart()
                    onOrderPlaced()
                } else {
                    errorMessage = "Failed to place order."
                }
            } catch (e: Exception) {
                errorMessage = "Order failed: ${e.localizedMessage ?: "Network error"}"
            } finally {
                isSubmitting = false
            }
        }
    }

    Scaffold(
        containerColor = Charcoal950,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Your Order Cart",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Serif,
                            color = TextPrimary
                        )
                        Text(
                            text = currentTable?.tableNumber ?: "Table",
                            fontSize = 11.sp,
                            color = EmberOrange
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Charcoal900)
            )
        },
        bottomBar = {
            if (cartItems.isNotEmpty()) {
                Surface(
                    color = Charcoal900,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Charcoal800),
                    modifier = Modifier.navigationBarsPadding()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Total breakdown
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(Charcoal950)
                                .border(1.dp, Charcoal800, RoundedCornerShape(14.dp))
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Subtotal", fontSize = 12.sp, color = TextSecondary)
                                Text("₹${subtotal.toInt()}", fontSize = 12.sp, color = TextPrimary)
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("5% GST", fontSize = 12.sp, color = TextSecondary)
                                Text("₹${tax.toInt()}", fontSize = 12.sp, color = TextPrimary)
                            }

                            Divider(color = Charcoal800, thickness = 1.dp, modifier = Modifier.padding(vertical = 4.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Total Amount", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                                Text("₹${total.toInt()}", fontSize = 16.sp, fontWeight = FontWeight.Black, color = EmberOrange)
                            }
                        }

                        // Send Order Button
                        Button(
                            onClick = { placeOrder() },
                            enabled = !isSubmitting,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = EmberOrange)
                        ) {
                            if (isSubmitting) {
                                CircularProgressIndicator(color = Charcoal950, modifier = Modifier.size(20.dp))
                            } else {
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.Send, contentDescription = null, tint = Charcoal950, modifier = Modifier.size(18.dp))
                                    Text(
                                        text = "Send to Kitchen • ₹${total.toInt()}",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 14.sp,
                                        color = Charcoal950
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    ) { padding ->
        if (cartItems.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.RestaurantMenu,
                        contentDescription = null,
                        tint = TextMuted,
                        modifier = Modifier.size(48.dp)
                    )
                    Text("Your cart is empty", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                    Text("Browse our woodfire menu and pick your dishes!", fontSize = 12.sp, color = TextMuted)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                if (errorMessage != null) {
                    item {
                        Surface(
                            color = NonVegRed.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, NonVegRed.copy(alpha = 0.4f))
                        ) {
                            Text(
                                text = errorMessage ?: "",
                                color = NonVegRed,
                                fontSize = 12.sp,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }
                }

                // Line Items
                items(cartItems) { cartItem ->
                    Card(
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = Charcoal900),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Charcoal800)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            AsyncImage(
                                model = cartItem.item.imageUrl,
                                contentDescription = cartItem.item.name,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .size(64.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Charcoal800)
                            )

                            Column(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = cartItem.item.name,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary,
                                        modifier = Modifier.weight(1f)
                                    )

                                    IconButton(
                                        onClick = { CartManager.removeFromCart(cartItem.id) },
                                        modifier = Modifier.size(24.dp)
                                    ) {
                                        Icon(Icons.Default.Delete, contentDescription = "Remove", tint = TextMuted, modifier = Modifier.size(16.dp))
                                    }
                                }

                                if (cartItem.selectedAddons.isNotEmpty()) {
                                    Text(
                                        text = "+ " + cartItem.selectedAddons.joinToString { it.name },
                                        fontSize = 11.sp,
                                        color = EmberGold
                                    )
                                }

                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(top = 4.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "₹${cartItem.lineTotal.toInt()}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = EmberOrange
                                    )

                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(Charcoal800)
                                            .padding(2.dp)
                                    ) {
                                        IconButton(
                                            onClick = { CartManager.updateQuantity(cartItem.id, cartItem.quantity - 1) },
                                            modifier = Modifier.size(22.dp)
                                        ) {
                                            Icon(Icons.Default.Remove, contentDescription = "-", tint = TextPrimary, modifier = Modifier.size(12.dp))
                                        }

                                        Text("${cartItem.quantity}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)

                                        IconButton(
                                            onClick = { CartManager.updateQuantity(cartItem.id, cartItem.quantity + 1) },
                                            modifier = Modifier.size(22.dp)
                                        ) {
                                            Icon(Icons.Default.Add, contentDescription = "+", tint = TextPrimary, modifier = Modifier.size(12.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Customer Special Notes
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 6.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "SPECIAL INSTRUCTIONS",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextMuted,
                            letterSpacing = 1.sp
                        )

                        OutlinedTextField(
                            value = customerNotes,
                            onValueChange = { CartManager.setNotes(it) },
                            placeholder = { Text("e.g. Less spicy, extra napkins...", fontSize = 12.sp, color = TextMuted) },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            maxLines = 2,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = Charcoal900,
                                unfocusedContainerColor = Charcoal900,
                                focusedBorderColor = EmberOrange,
                                unfocusedBorderColor = Charcoal800,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            )
                        )
                    }
                }
            }
        }
    }
}
