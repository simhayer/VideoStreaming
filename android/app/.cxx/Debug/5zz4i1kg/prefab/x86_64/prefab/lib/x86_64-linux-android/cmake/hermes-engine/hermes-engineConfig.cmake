if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/shayer/.gradle/caches/transforms-3/1efbb783a25e4b3b25304c66de7fa134/transformed/jetified-hermes-android-0.73.3-debug/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/shayer/.gradle/caches/transforms-3/1efbb783a25e4b3b25304c66de7fa134/transformed/jetified-hermes-android-0.73.3-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

