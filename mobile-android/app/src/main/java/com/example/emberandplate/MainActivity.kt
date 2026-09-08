package com.example.emberandplate

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.example.emberandplate.data.CartManager
import com.example.emberandplate.ui.screens.*
import com.example.emberandplate.ui.theme.Charcoal950
import com.example.emberandplate.ui.theme.EmberAndPlateTheme

enum class Screen {
    TABLE_SCAN,
    MENU_BROWSE,
    CART,
    ORDER_TRACKER
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            EmberAndPlateTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Charcoal950
                ) {
                    var currentScreen by remember { mutableStateOf(Screen.TABLE_SCAN) }
                    val currentTable by CartManager.currentTable.collectAsState()

                    // If table is bound, go to menu
                    LaunchedEffect(currentTable) {
                        if (currentTable != null && currentScreen == Screen.TABLE_SCAN) {
                            currentScreen = Screen.MENU_BROWSE
                        }
                    }

                    when (currentScreen) {
                        Screen.TABLE_SCAN -> {
                            TableScanScreen(
                                onTableResolved = { currentScreen = Screen.MENU_BROWSE }
                            )
                        }
                        Screen.MENU_BROWSE -> {
                            MenuBrowseScreen(
                                onNavigateToCart = { currentScreen = Screen.CART },
                                onNavigateToTracker = { currentScreen = Screen.ORDER_TRACKER },
                                onChangeTable = {
                                    CartManager.clearTableSession()
                                    currentScreen = Screen.TABLE_SCAN
                                }
                            )
                        }
                        Screen.CART -> {
                            CartScreen(
                                onNavigateBack = { currentScreen = Screen.MENU_BROWSE },
                                onOrderPlaced = { currentScreen = Screen.ORDER_TRACKER }
                            )
                        }
                        Screen.ORDER_TRACKER -> {
                            OrderTrackerScreen(
                                onNavigateBack = { currentScreen = Screen.MENU_BROWSE }
                            )
                        }
                    }
                }
            }
        }
    }
}
