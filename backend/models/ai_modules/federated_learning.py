import tensorflow_federated as tff
from typing import List, Dict
import numpy as np

class FederatedLearningSystem:
    def __init__(self):
        self.client_models = {}
        self.global_model = None
        self.initialize_models()

    def initialize_models(self):
        """Initialize federated learning models"""
        self.global_model = self.create_global_model()
        self.federated_training = tff.learning.algorithms.build_weighted_fed_avg(
            self.model_fn,
            client_optimizer_fn=lambda: tf.keras.optimizers.Adam(0.01),
            server_optimizer_fn=lambda: tf.keras.optimizers.SGD(1.0)
        )

    def create_global_model(self):
        """Create the global model architecture"""
        return tf.keras.Sequential([
            tf.keras.layers.Dense(256, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])

    async def update_from_client(self, client_id: str, local_data: Dict):
        """Update model with client data while preserving privacy"""
        processed_data = self.preprocess_client_data(local_data)
        self.client_models[client_id] = self.train_local_model(processed_data)
        await self.aggregate_models()

    async def aggregate_models(self):
        """Aggregate client models into global model"""
        weights = []
        for client_id, model in self.client_models.items():
            weights.append(model.get_weights())
        
        # Federated averaging
        averaged_weights = [
            np.mean([w[i] for w in weights], axis=0)
            for i in range(len(weights[0]))
        ]
        
        self.global_model.set_weights(averaged_weights) 