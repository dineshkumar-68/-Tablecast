package com.example.emberandplate.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = EmberOrange,
    onPrimary = Charcoal950,
    primaryContainer = Charcoal800,
    onPrimaryContainer = EmberOrangeLight,
    secondary = EmberGold,
    onSecondary = Charcoal950,
    background = Charcoal950,
    onBackground = TextPrimary,
    surface = Charcoal900,
    onSurface = TextPrimary,
    surfaceVariant = Charcoal850,
    onSurfaceVariant = TextSecondary,
    outline = Charcoal700,
    error = NonVegRed,
    onError = TextPrimary
)

@Composable
fun EmberAndPlateTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
