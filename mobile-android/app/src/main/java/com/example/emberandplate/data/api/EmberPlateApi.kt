package com.example.emberandplate.data.api

import com.example.emberandplate.data.models.*
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

interface EmberPlateApiService {
    @GET("api/tables/{qr_token}")
    suspend fun getTableInfo(@Path("qr_token") qrToken: String): TableResponse

    @GET("api/menu")
    suspend fun getMenu(): MenuResponse

    @POST("api/orders")
    suspend fun createOrder(@Body request: CreateOrderRequest): CreateOrderResponse

    @GET("api/orders/{id}")
    suspend fun trackOrder(
        @Path("id") orderId: String,
        @Header("x-tracking-token") trackingToken: String
    ): TrackOrderResponse
}

object ApiClient {
    // 10.0.2.2 is localhost on Android Emulator; fallback to LAN / localhost
    private var baseUrl: String = "http://10.0.2.2:5001/"

    fun setBaseUrl(url: String) {
        baseUrl = if (url.endsWith("/")) url else "$url/"
        service = createService(baseUrl)
    }

    fun getBaseUrl(): String = baseUrl

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        isLenient = true
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    private fun createService(url: String): EmberPlateApiService {
        val contentType = "application/json".toMediaType()
        return Retrofit.Builder()
            .baseUrl(url)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(EmberPlateApiService::class.java)
    }

    var service: EmberPlateApiService = createService(baseUrl)
        private set
}
