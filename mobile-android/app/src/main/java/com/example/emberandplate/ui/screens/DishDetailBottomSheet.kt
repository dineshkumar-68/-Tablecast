package com.example.emberandplate.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.emberandplate.data.CartManager
import com.example.emberandplate.data.models.MenuItem
import com.example.emberandplate.data.models.MenuItemAddon
import com.example.emberandplate.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DishDetailBottomSheet(
    item: MenuItem,
    onDismiss: () -> Unit,
    onAddedToCart: () -> Unit
) {
    var quantity by remember { mutableIntStateOf(1) }
    var selectedAddons by remember { mutableStateOf<List<MenuItemAddon>>(emptyList()) }

    val addonsTotal = selectedAddons.sumOf { it.price }
    val totalLinePrice = (item.price + addonsTotal) * quantity

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Charcoal900,
        dragHandle = { BottomSheetDefaults.DragHandle(color = Charcoal600) }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp)
        ) {
            // Food Image
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .background(Charcoal950)
            ) {
                AsyncImage(
                    model = item.imageUrl,
                    contentDescription = item.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )

                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                listOf(androidx.compose.ui.graphics.Color.Transparent, Charcoal900)
                            )
                        )
                )

                // Close Button
                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(12.dp)
                        .background(Charcoal950.copy(alpha = 0.7f), RoundedCornerShape(20.dp))
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = TextPrimary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Title and Price
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(if (item.isVeg) VegGreen else NonVegRed)
                            )
                            Text(
                                text = item.name,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Serif,
                                color = TextPrimary
                            )
                        }

                        Text(
                            text = item.description,
                            fontSize = 12.sp,
                            color = TextSecondary,
                            modifier = Modifier.padding(top = 4.dp),
                            lineHeight = 16.sp
                        )
                    }

                    Text(
                        text = "₹${item.price.toInt()}",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmberOrange
                    )
                }

                // Addons Section
                if (item.addons.isNotEmpty()) {
                    Text(
                        text = "CUSTOMISE & ADD-ONS",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted,
                        letterSpacing = 1.sp
                    )

                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        item.addons.forEach { addon ->
                            val isSelected = selectedAddons.any { it.id == addon.id }
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isSelected) EmberOrange.copy(alpha = 0.1f) else Charcoal800)
                                    .border(
                                        1.dp,
                                        if (isSelected) EmberOrange.copy(alpha = 0.5f) else Charcoal700,
                                        RoundedCornerShape(12.dp)
                                    )
                                    .clickable {
                                        selectedAddons = if (isSelected) {
                                            selectedAddons.filter { it.id != addon.id }
                                        } else {
                                            selectedAddons + addon
                                        }
                                    }
                                    .padding(horizontal = 14.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(18.dp)
                                            .clip(RoundedCornerShape(5.dp))
                                            .background(if (isSelected) EmberOrange else Charcoal900)
                                            .border(1.dp, if (isSelected) EmberOrange else Charcoal600, RoundedCornerShape(5.dp)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (isSelected) {
                                            Icon(
                                                imageVector = Icons.Default.Check,
                                                contentDescription = null,
                                                tint = Charcoal950,
                                                modifier = Modifier.size(12.dp)
                                            )
                                        }
                                    }

                                    Text(
                                        text = addon.name,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = TextPrimary
                                    )
                                }

                                Text(
                                    text = "+₹${addon.price.toInt()}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = EmberGold
                                )
                            }
                        }
                    }
                }

                // Quantity Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "QUANTITY",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted,
                        letterSpacing = 1.sp
                    )

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(Charcoal800)
                            .padding(4.dp)
                    ) {
                        IconButton(
                            onClick = { if (quantity > 1) quantity-- },
                            modifier = Modifier
                                .size(28.dp)
                                .background(Charcoal700, RoundedCornerShape(8.dp))
                        ) {
                            Icon(Icons.Default.Remove, contentDescription = "Decrease", tint = TextPrimary, modifier = Modifier.size(14.dp))
                        }

                        Text(
                            text = "$quantity",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )

                        IconButton(
                            onClick = { quantity++ },
                            modifier = Modifier
                                .size(28.dp)
                                .background(Charcoal700, RoundedCornerShape(8.dp))
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Increase", tint = TextPrimary, modifier = Modifier.size(14.dp))
                        }
                    }
                }

                // Add to Cart Action Button
                Button(
                    onClick = {
                        CartManager.addToCart(item, quantity, selectedAddons)
                        onAddedToCart()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                        .padding(top = 8.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EmberOrange)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.ShoppingBag,
                            contentDescription = null,
                            tint = Charcoal950,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "Add to Order • ₹${totalLinePrice.toInt()}",
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
