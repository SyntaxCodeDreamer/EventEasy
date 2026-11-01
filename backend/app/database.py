import os
import json
import uuid
import datetime
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Dual-mode database: Uses MongoDB if reachable; gracefully falls back to resilient JSON storage
class DatabaseManager:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.is_connected = False
        self.local_storage_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data_storage")
        os.makedirs(self.local_storage_dir, exist_ok=True)

    async def connect(self):
        try:
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URI, 
                serverSelectionTimeoutMS=2000
            )
            # Ping database
            await self.client.admin.command('ping')
            self.db = self.client[settings.DB_NAME]
            self.is_connected = True
            print("[Database] Successfully connected to MongoDB Atlas / Local MongoDB.")
        except Exception as e:
            self.is_connected = False
            self.db = None
            print(f"[Database] Notice: MongoDB not reachable ({e}). Initializing embedded resilient storage.")

    def _get_local_file(self, collection_name: str) -> str:
        return os.path.join(self.local_storage_dir, f"{collection_name}.json")

    def _read_local(self, collection_name: str) -> List[Dict[str, Any]]:
        path = self._get_local_file(collection_name)
        if not os.path.exists(path):
            return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _write_local(self, collection_name: str, data: List[Dict[str, Any]]):
        path = self._get_local_file(collection_name)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)

    # Generic CRUD methods
    async def insert_one(self, collection: str, document: Dict[str, Any]) -> str:
        if "_id" not in document:
            document["_id"] = str(uuid.uuid4())
        if "created_at" not in document:
            document["created_at"] = datetime.datetime.utcnow().isoformat()
        if "updated_at" not in document:
            document["updated_at"] = document["created_at"]

        if self.is_connected and self.db is not None:
            await self.db[collection].insert_one(document)
            return document["_id"]
        else:
            items = self._read_local(collection)
            items.append(document)
            self._write_local(collection, items)
            return document["_id"]

    async def find_one(self, collection: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            res = await self.db[collection].find_one(query)
            if res and "_id" in res:
                res["_id"] = str(res["_id"])
            return res
        else:
            items = self._read_local(collection)
            for item in items:
                match = True
                for k, v in query.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    return item
            return None

    async def find(self, collection: str, query: Dict[str, Any] = None, sort_field: str = None, sort_order: int = -1) -> List[Dict[str, Any]]:
        query = query or {}
        if self.is_connected and self.db is not None:
            cursor = self.db[collection].find(query)
            if sort_field:
                cursor = cursor.sort(sort_field, sort_order)
            results = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                results.append(doc)
            return results
        else:
            items = self._read_local(collection)
            filtered = []
            for item in items:
                match = True
                for k, v in query.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    filtered.append(item)
            if sort_field:
                filtered.sort(key=lambda x: str(x.get(sort_field, "")), reverse=(sort_order == -1))
            return filtered

    async def update_one(self, collection: str, query: Dict[str, Any], update_data: Dict[str, Any]) -> bool:
        if "$set" in update_data:
            fields_to_update = update_data["$set"]
        else:
            fields_to_update = update_data
        fields_to_update["updated_at"] = datetime.datetime.utcnow().isoformat()

        if self.is_connected and self.db is not None:
            result = await self.db[collection].update_one(query, {"$set": fields_to_update})
            return result.modified_count > 0 or result.matched_count > 0
        else:
            items = self._read_local(collection)
            updated = False
            for i, item in enumerate(items):
                match = True
                for k, v in query.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    items[i].update(fields_to_update)
                    updated = True
                    break
            if updated:
                self._write_local(collection, items)
            return updated

    async def delete_one(self, collection: str, query: Dict[str, Any]) -> bool:
        if self.is_connected and self.db is not None:
            result = await self.db[collection].delete_one(query)
            return result.deleted_count > 0
        else:
            items = self._read_local(collection)
            initial_len = len(items)
            items = [item for item in items if not all(item.get(k) == v for k, v in query.items())]
            if len(items) < initial_len:
                self._write_local(collection, items)
                return True
            return False

db_manager = DatabaseManager()

