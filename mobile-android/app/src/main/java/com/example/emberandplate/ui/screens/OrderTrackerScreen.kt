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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.emberandplate.data.CartManager
import com.example.emberandplate.data.api.ApiClient
import com.example.emberandplate.data.models.TrackOrderDetail
import com.example.emberandplate.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderTrackerScreen(
    onNavigateBack: () -> Unit
) {
    val activeOrder by CartManager.activeOrder.collectAsState()
    var orderDetail by remember { mutableStateOf<TrackOrderDetail?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Poll every 3 seconds for live kitchen updates
    LaunchedEffect(activeOrder) {
        val order = activeOrder ?: return@LaunchedEffect
        while (isActive) {
            try {
                val res = ApiClient.service.trackOrder(order.id, order.trackingToken)
                orderDetail = res.order
                errorMessage = null
            } catch (e: Exception) {
                errorMessage = "Could not sync status: ${e.localizedMessage}"
            }
            delay(3000)
        }
    }

    val currentStatus = orderDetail?.status ?: activeOrder?.status ?: "PLACED"

    val steps = listOf(
        Pair("PLACED", Pair("Order Placed", "Sent to kitchen")),
        Pair("PREPARING", Pair("Preparing", "Crafting in woodfire oven")),
        Pair("READY", Pair("Ready to Serve", "Plating & garnish complete")),
        Pair("SERVED", Pair("Served", "Enjoy your meal!"))
    )

    fun getStepIndex(st: String): Int {
        return when (st) {
            "PLACED" -> 0
            "PREPARING" -> 1
            "READY" -> 2
            "SERVED" -> 3
            else -> 0
        }
    }

    val currentIdx = getStepIndex(currentStatus)

    Scaffold(
        containerColor = Charcoal950,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Live Order Tracker",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Serif,
                            color = TextPrimary
                        )
                        Text(
                            text = "Auto-syncing every 3s",
                            fontSize = 11.sp,
                            color = EmberGold
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
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Card
            item {
                Card(
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = Charcoal900),
                    border = androidx.compose.foundation.BorderStroke(1.dp, EmberOrange.copy(alpha = 0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("ORDER TICKET", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextMuted, letterSpacing = 1.sp)
                                Text(
                                    text = activeOrder?.orderNumber ?: "EP-1001",
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Serif,
                                    color = EmberOrangeLight
                                )
                            }

                            Surface(
                                color = Charcoal800,
                                shape = RoundedCornerShape(12.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Charcoal700)
                            ) {
                                Text(
                                    text = activeOrder?.tableNumber ?: "Table",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(modifier = Modifier.size(8.dp).clip(RoundedCornerShape(4.dp)).background(VegGreen))
                            Text(
                                text = "Estimated Prep: ~${orderDetail?.prepTimeMinutes ?: activeOrder?.prepTimeMinutes ?: 15} mins",
                                fontSize = 12.sp,
                                color = TextSecondary
                            )
                        }
                    }
                }
            }

            // Timeline Stepper Card
            item {
                Card(
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = Charcoal900),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Charcoal800),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(20.dp)
                    ) {
                        Text(
                            text = "ORDER PROGRESS",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextMuted,
                            letterSpacing = 1.sp
                        )

                        steps.forEachIndexed { idx, (key, stepData) ->
                            val isCompleted = idx < currentIdx
                            val isCurrent = idx == currentIdx

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(14.dp),
                                verticalAlignment = Alignment.Top
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(24.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(
                                            when {
                                                isCompleted -> VegGreen
                                                isCurrent -> EmberOrange
                                                else -> Charcoal800
                                            }
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (isCompleted) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = Charcoal950, modifier = Modifier.size(14.dp))
                                    } else {
                                        Text("${idx + 1}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (isCurrent) Charcoal950 else TextSecondary)
                                    }
                                }

                                Column {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(
                                            text = stepData.first,
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isCurrent) EmberOrangeLight else if (isCompleted) TextPrimary else TextMuted
                                        )

                                        if (isCurrent) {
                                            Surface(
                                                color = EmberOrange.copy(alpha = 0.15f),
                                                shape = RoundedCornerShape(6.dp)
                                            ) {
                                                Text(
                                                    text = "In Progress",
                                                    fontSize = 9.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = EmberOrange,
                                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                )
                                            }
                                        }
                                    }

                                    Text(
                                        text = stepData.second,
                                        fontSize = 11.sp,
                                        color = if (isCurrent || isCompleted) TextSecondary else TextMuted,
                                        modifier = Modifier.padding(top = 2.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Items Receipt Breakdown
            orderDetail?.items?.let { items ->
                item {
                    Card(
                        shape = RoundedCornerShape(24.dp),
                        colors = CardDefaults.cardColors(containerColor = Charcoal900),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Charcoal800),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text(
                                text = "ORDER ITEMS (${items.size})",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextMuted,
                                letterSpacing = 1.sp
                            )

                            items.forEach { lineItem ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Text(
                                            text = "${lineItem.quantity}×",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Black,
                                            color = EmberOrange
                                        )
                                        Text(
                                            text = lineItem.name,
                                            fontSize = 12.sp,
                                            color = TextPrimary
                                        )
                                    }

                                    Text(
                                        text = "₹${lineItem.subtotal.toInt()}",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                }
                            }

                            Divider(color = Charcoal800, thickness = 1.dp, modifier = Modifier.padding(vertical = 4.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Total Paid", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                                Text("₹${orderDetail?.totalAmount?.toInt() ?: 0}", fontSize = 16.sp, fontWeight = FontWeight.Black, color = EmberOrange)
                            }
                        }
                    }
                }
            }

            // Back / Order More Button
            item {
                OutlinedButton(
                    onClick = onNavigateBack,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Charcoal700)
                ) {
                    Text("Order More Dishes", color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
