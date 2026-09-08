package com.example.emberandplate.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.emberandplate.data.CartManager
import com.example.emberandplate.data.api.ApiClient
import com.example.emberandplate.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun TableScanScreen(
    onTableResolved: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var manualToken by remember { mutableStateOf("tbl_01_tok_84f9a1") }

    val demoTables = listOf(
        Pair("Table 01", "tbl_01_tok_84f9a1"),
        Pair("Table 02", "tbl_02_tok_93e7b2"),
        Pair("Table 03", "tbl_03_tok_12c4d5")
    )

    fun resolveTable(token: String) {
        coroutineScope.launch {
            isLoading = true
            errorMessage = null
            try {
                val res = ApiClient.service.getTableInfo(token)
                CartManager.setTableSession(res.table, res.restaurant)
                onTableResolved()
            } catch (e: Exception) {
                errorMessage = "Could not resolve table QR: ${e.localizedMessage ?: "Table not found"}"
            } finally {
                isLoading = false
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Charcoal950)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(28.dp))
                .background(Charcoal900)
                .border(1.dp, Charcoal700, RoundedCornerShape(28.dp))
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Logo / QR Icon
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        Brush.linearGradient(listOf(EmberOrange, EmberAmber))
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.QrCodeScanner,
                    contentDescription = "Scan Table QR",
                    tint = Charcoal950,
                    modifier = Modifier.size(36.dp)
                )
            }

            Text(
                text = "EMBER & PLATE",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Serif,
                color = EmberOrangeLight
            )

            Text(
                text = "Scan the QR code on your restaurant table to view the menu and place your order.",
                fontSize = 13.sp,
                color = TextSecondary,
                textAlign = TextAlign.Center,
                lineHeight = 18.sp
            )

            if (errorMessage != null) {
                Surface(
                    color = NonVegRed.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NonVegRed.copy(alpha = 0.4f))
                ) {
                    Text(
                        text = errorMessage ?: "",
                        color = NonVegRed,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(10.dp),
                        textAlign = TextAlign.Center
                    )
                }
            }

            // Quick Demo Buttons
            Text(
                text = "Fast Table Simulation",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = EmberGold,
                modifier = Modifier.padding(top = 8.dp)
            )

            demoTables.forEach { (label, token) ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(Charcoal800)
                        .border(1.dp, Charcoal700, RoundedCornerShape(14.dp))
                        .clickable(enabled = !isLoading) { resolveTable(token) }
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(EmberOrange)
                        )
                        Text(
                            text = "Simulate $label Scan",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        )
                    }

                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = null,
                        tint = TextSecondary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            if (isLoading) {
                CircularProgressIndicator(
                    color = EmberOrange,
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    }
}
