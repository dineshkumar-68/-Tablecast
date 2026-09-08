package com.example.emberandplate.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.emberandplate.data.CartManager
import com.example.emberandplate.data.api.ApiClient
import com.example.emberandplate.data.models.MenuCategory
import com.example.emberandplate.data.models.MenuItem
import com.example.emberandplate.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun MenuBrowseScreen(
    onNavigateToCart: () -> Unit,
    onNavigateToTracker: () -> Unit,
    onChangeTable: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val currentTable by CartManager.currentTable.collectAsState()
    val restaurantInfo by CartManager.restaurantInfo.collectAsState()
    val cartItems by CartManager.cartItems.collectAsState()
    val activeOrder by CartManager.activeOrder.collectAsState()

    var categories by remember { mutableStateOf<List<MenuCategory>>(emptyList()) }
    var selectedCategoryId by remember { mutableStateOf("ALL") }
    var searchQuery by remember { mutableStateOf("") }
    var dietFilter by remember { mutableStateOf("ALL") } // "ALL", "VEG", "NON_VEG"
    var isPopularOnly by remember { mutableStateOf(false) }

    var selectedItemForDetail by remember { mutableStateOf<MenuItem?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    fun fetchMenu() {
        coroutineScope.launch {
            isLoading = true
            try {
                val res = ApiClient.service.getMenu()
                categories = res.categories
            } catch (e: Exception) {
                // handle error
            } finally {
                isLoading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        fetchMenu()
    }

    val allItems = remember(categories) {
        categories.flatMap { it.items }
    }

    val filteredItems = remember(allItems, selectedCategoryId, searchQuery, dietFilter, isPopularOnly) {
        allItems.filter { item ->
            if (selectedCategoryId != "ALL" && item.categoryId != selectedCategoryId) return@filter false
            if (dietFilter == "VEG" && !item.isVeg) return@filter false
            if (dietFilter == "NON_VEG" && item.isVeg) return@filter false
            if (isPopularOnly && !item.isPopular) return@filter false
            if (searchQuery.isNotBlank()) {
                val q = searchQuery.lowercase()
                if (!item.name.lowercase().contains(q) && !item.description.lowercase().contains(q)) {
                    return@filter false
                }
            }
            true
        }
    }

    Scaffold(
        containerColor = Charcoal950,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Charcoal900)
                    .border(1.dp, Charcoal800)
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                // Restaurant and Table Banner
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Brush.linearGradient(listOf(EmberOrange, EmberAmber))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.LocalFireDepartment, contentDescription = null, tint = Charcoal950, modifier = Modifier.size(20.dp))
                        }

                        Column {
                            Text(
                                text = restaurantInfo?.name ?: "EMBER & PLATE",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Serif,
                                color = TextPrimary
                            )
                            Text(
                                text = restaurantInfo?.tagline ?: "Artisanal Woodfire Dining",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }
                    }

                    // Table Pill
                    Surface(
                        color = Charcoal800,
                        shape = RoundedCornerShape(20.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EmberOrange.copy(alpha = 0.5f)),
                        modifier = Modifier.clickable { onChangeTable() }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(modifier = Modifier.size(6.dp).clip(RoundedCornerShape(3.dp)).background(VegGreen))
                            Text(
                                text = currentTable?.tableNumber ?: "Table",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = EmberOrangeLight
                            )
                        }
                    }
                }
            }
        },
        bottomBar = {
            val totalCount = CartManager.totalItemsCount
            val grandTotal = CartManager.grandTotal

            if (totalCount > 0 || activeOrder != null) {
                Surface(
                    color = Charcoal900,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Charcoal800),
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        if (activeOrder != null) {
                            OutlinedButton(
                                onClick = onNavigateToTracker,
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp),
                                shape = RoundedCornerShape(14.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, EmberOrange.copy(alpha = 0.6f))
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Box(modifier = Modifier.size(6.dp).clip(RoundedCornerShape(3.dp)).background(VegGreen))
                                    Text("Track ${activeOrder?.orderNumber}", color = EmberOrange, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        if (totalCount > 0) {
                            Button(
                                onClick = onNavigateToCart,
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp),
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = EmberOrange)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Icon(Icons.Default.ShoppingBag, contentDescription = null, tint = Charcoal950, modifier = Modifier.size(16.dp))
                                        Text("Cart ($totalCount)", color = Charcoal950, fontSize = 12.sp, fontWeight = FontWeight.Black)
                                    }
                                    Text("₹${grandTotal.toInt()}", color = Charcoal950, fontSize = 13.sp, fontWeight = FontWeight.Black)
                                }
                            }
                        }
                    }
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = 24.dp)
        ) {
            // Category Tabs Row
            item {
                LazyRow(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedCategoryId == "ALL",
                            onClick = { selectedCategoryId = "ALL" },
                            label = { Text("All Dishes", fontSize = 12.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = EmberOrange,
                                selectedLabelColor = Charcoal950,
                                containerColor = Charcoal900,
                                labelColor = TextSecondary
                            )
                        )
                    }

                    items(categories) { cat ->
                        FilterChip(
                            selected = selectedCategoryId == cat.id,
                            onClick = { selectedCategoryId = cat.id },
                            label = { Text(cat.name, fontSize = 12.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = EmberOrange,
                                selectedLabelColor = Charcoal950,
                                containerColor = Charcoal900,
                                labelColor = TextSecondary
                            )
                        )
                    }
                }
            }

            // Search Bar & Filter Chips
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Search woodfire dishes, starters...", fontSize = 12.sp, color = TextMuted) },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted, modifier = Modifier.size(18.dp)) },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Default.Close, contentDescription = "Clear", tint = TextMuted, modifier = Modifier.size(16.dp))
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Charcoal900,
                            unfocusedContainerColor = Charcoal900,
                            focusedBorderColor = EmberOrange,
                            unfocusedBorderColor = Charcoal800,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        singleLine = true
                    )

                    // Veg / Non-Veg / Bestseller quick toggles
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Surface(
                            color = if (dietFilter == "VEG") VegGreen.copy(alpha = 0.2f) else Charcoal900,
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (dietFilter == "VEG") VegGreen else Charcoal800
                            ),
                            modifier = Modifier.clickable {
                                dietFilter = if (dietFilter == "VEG") "ALL" else "VEG"
                            }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Box(modifier = Modifier.size(6.dp).clip(RoundedCornerShape(3.dp)).background(VegGreen))
                                Text("Veg Only", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = if (dietFilter == "VEG") VegGreen else TextSecondary)
                            }
                        }

                        Surface(
                            color = if (dietFilter == "NON_VEG") NonVegRed.copy(alpha = 0.2f) else Charcoal900,
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (dietFilter == "NON_VEG") NonVegRed else Charcoal800
                            ),
                            modifier = Modifier.clickable {
                                dietFilter = if (dietFilter == "NON_VEG") "ALL" else "NON_VEG"
                            }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Box(modifier = Modifier.size(6.dp).clip(RoundedCornerShape(3.dp)).background(NonVegRed))
                                Text("Non-Veg", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = if (dietFilter == "NON_VEG") NonVegRed else TextSecondary)
                            }
                        }

                        Surface(
                            color = if (isPopularOnly) EmberOrange.copy(alpha = 0.2f) else Charcoal900,
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (isPopularOnly) EmberOrange else Charcoal800
                            ),
                            modifier = Modifier.clickable { isPopularOnly = !isPopularOnly }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(Icons.Default.LocalFireDepartment, contentDescription = null, tint = EmberOrange, modifier = Modifier.size(12.dp))
                                Text("Bestsellers", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = if (isPopularOnly) EmberOrange else TextSecondary)
                            }
                        }
                    }
                }
            }

            // Food Items Cards
            items(filteredItems) { item ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                        .clickable { selectedItemForDetail = item },
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Charcoal900),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Charcoal800)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Food Image Thumbnail
                        Box(
                            modifier = Modifier
                                .size(90.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(Charcoal800)
                        ) {
                            AsyncImage(
                                model = item.imageUrl,
                                contentDescription = item.name,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )

                            // Veg / Non-Veg badge over image
                            Box(
                                modifier = Modifier
                                    .padding(6.dp)
                                    .size(14.dp)
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(Charcoal950.copy(alpha = 0.8f))
                                    .border(1.dp, if (item.isVeg) VegGreen else NonVegRed, RoundedCornerShape(4.dp))
                                    .align(Alignment.TopStart),
                                contentAlignment = Alignment.Center
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(RoundedCornerShape(3.dp))
                                        .background(if (item.isVeg) VegGreen else NonVegRed)
                                )
                            }
                        }

                        // Dish Details
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .height(90.dp),
                            verticalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = item.name,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = item.description,
                                    fontSize = 11.sp,
                                    color = TextSecondary,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis,
                                    lineHeight = 15.sp,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "₹${item.price.toInt()}",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black,
                                    color = EmberOrange
                                )

                                Surface(
                                    color = EmberOrange.copy(alpha = 0.15f),
                                    shape = RoundedCornerShape(8.dp),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, EmberOrange.copy(alpha = 0.4f))
                                ) {
                                    Text(
                                        text = if (item.addons.isNotEmpty()) "Customise +" else "Add +",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = EmberOrange,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Detail Bottom Sheet
    selectedItemForDetail?.let { item ->
        DishDetailBottomSheet(
            item = item,
            onDismiss = { selectedItemForDetail = null },
            onAddedToCart = { selectedItemForDetail = null }
        )
    }
}
