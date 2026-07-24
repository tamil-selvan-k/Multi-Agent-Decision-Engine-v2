import uuid
from sqlalchemy import Column, Integer, String, Float, Date, Boolean, ForeignKey, DateTime, Numeric, BigInteger, JSON
from sqlalchemy.sql import func
from sqlalchemy.types import UserDefinedType
from app.core.database import Base, engine

class SalesData(Base):
    __tablename__ = "sales_data"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(String, nullable=False)

    date = Column(String, index=True, nullable=False)

    product_id = Column(String, nullable=False)
    product_name = Column(String, nullable=False)

    quantity = Column(Integer, nullable=False)

    selling_price = Column(Float, nullable=False)

    revenue = Column(Float, nullable=False)

    region = Column(String, nullable=False)

    sales = Column(Float, nullable=False)

class ForecastData(Base):
    __tablename__ = "forecast_data"

    id = Column(Integer, primary_key=True, index=True)

    forecast = Column(Float)

    confidence = Column(Float)
    
class GrowthData(Base):
    __tablename__ = "growth_data"

    id = Column(Integer, primary_key=True, index=True)
    growth = Column(Float)

class ProductionRecommendation(Base):
    __tablename__ = "production_recommendation"

    id = Column(Integer, primary_key=True, index=True)
    recommendation = Column(String)

class InventoryData(Base):
    __tablename__ = "inventory_data"

    id = Column(Integer, primary_key=True, index=True)
    current_stock = Column(Integer)
    warehouse_capacity = Column(Integer)
    safety_stock = Column(Integer)

class InventoryHistory(Base):
    __tablename__ = "inventory_history"

    id = Column(Integer, primary_key=True, index=True)

    month = Column(String)

    current_stock = Column(Integer)

    sold = Column(Integer)

    incoming_stock = Column(Integer)

    warehouse_capacity = Column(Integer)

    safety_stock = Column(Integer)

class Supplier(Base):
    __tablename__ = "supplier"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)

    lead_time = Column(Integer)          # days

    cost_per_unit = Column(Float)

    reliability = Column(Float)

    rating = Column(Float)

    quality_score = Column(Float)

    on_time_delivery = Column(Float)

    available_stock = Column(Integer)

class SupplierRecommendation(Base):
    __tablename__ = "supplier_recommendation"

    id = Column(Integer, primary_key=True, index=True)

    supplier = Column(String)

    quantity = Column(Integer)

    estimated_cost = Column(Float)

    lead_time = Column(Integer)

    score = Column(Float)

    reason = Column(String)

class DemandForecast(Base):
    __tablename__ = "demand_forecast"

    id = Column(Integer, primary_key=True, index=True)
    predicted_demand = Column(Integer)

class WarehouseCapacity(Base):
    __tablename__ = "warehouse_capacity"

    id = Column(Integer, primary_key=True, index=True)
    utilization = Column(Float)
    status = Column(String)

class ReorderRecommendation(Base):
    __tablename__ = "reorder_recommendation"

    id = Column(Integer, primary_key=True, index=True)
    reorder = Column(Boolean)
    quantity = Column(Integer)
    priority = Column(String)

class BudgetData(Base):
    __tablename__ = "budget_data"

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String, index=True)
    budget = Column(Integer)
    spending = Column(Integer)

class AnomalyData(Base):
    __tablename__ = "anomaly_data"

    id = Column(Integer, primary_key=True, index=True)
    anomaly = Column(Boolean)
    score = Column(Float)

class CostEstimate(Base):
    __tablename__ = "cost_estimate"

    id = Column(Integer, primary_key=True, index=True)
    extra_cost = Column(Integer)

class BudgetImpact(Base):
    __tablename__ = "budget_impact"

    id = Column(Integer, primary_key=True, index=True)
    budget_exceeded = Column(Boolean)
    remaining_budget = Column(Integer)
    cashflow = Column(String)

class InventoryRisk(Base):
    __tablename__ = "inventory_risk"

    id = Column(Integer, primary_key=True, index=True)
    risk_score = Column(Float)
    risk_level = Column(String)

class InventorySummary(Base):
    __tablename__ = "inventory_summary"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String)
    action = Column(String)
    expected_stockout = Column(Boolean)

class FinancialHistory(Base):
    __tablename__ = "financial_history"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, index=True)
    department = Column(String)
    budget = Column(Integer)
    spending = Column(Integer)
    revenue = Column(Integer)
    operational_cost = Column(Integer)
    procurement_cost = Column(Integer)

class FinancialRisk(Base):
    __tablename__ = "financial_risk"

    id = Column(Integer, primary_key=True, index=True)
    risk_score = Column(Float)
    risk_level = Column(String)

class FinancialROI(Base):
    __tablename__ = "financial_roi"

    id = Column(Integer, primary_key=True, index=True)
    roi = Column(Float)
    profitable = Column(Boolean)
    expected_return = Column(Integer)
    
class Shipment(Base):
    __tablename__ = "shipment"

    id = Column(Integer, primary_key=True, index=True)

    shipment_id = Column(String, unique=True, index=True)

    order_id = Column(String)

    supplier_id = Column(String)

    supplier_name = Column(String)

    warehouse_id = Column(String)

    origin = Column(String)

    destination = Column(String)

    vehicle_type = Column(String)

    distance_km = Column(Float)

    dispatch_date = Column(String)

    eta = Column(Float)

    actual_delivery_date = Column(String)

    transportation_cost = Column(Float)

    status = Column(String)

    delay_hours = Column(Float)

    lead_time = Column(Integer)

    supplier_reliability = Column(Float)

    quality_score = Column(Float)

    on_time_delivery = Column(Float)

    available_stock = Column(Integer)

class RouteOptimization(Base):
    __tablename__ = "route_optimization"

    id = Column(Integer, primary_key=True, index=True)
    best_route = Column(String)  # storing as JSON string or comma-separated
    total_distance_km = Column(Integer)

class DeliveryETA(Base):
    __tablename__ = "delivery_eta"

    id = Column(Integer, primary_key=True, index=True)
    estimated_delivery_hours = Column(Integer)
    delay_probability = Column(Float)

class WarehouseAssignment(Base):
    __tablename__ = "warehouse_assignment"

    id = Column(Integer, primary_key=True, index=True)
    recommended_warehouse = Column(String)

class DeliveryRisk(Base):
    __tablename__ = "delivery_risk"

    id = Column(Integer, primary_key=True, index=True)

    risk_score = Column(Float)

    risk_level = Column(String)

    reason = Column(String)
class RevenueAnalysis(Base):
    __tablename__ = "revenue_analysis"

    id = Column(Integer, primary_key=True, index=True)
    total_revenue = Column(Float)
    average_order_value = Column(Float)
    highest_sale = Column(Float)

class TopSellingProduct(Base):
    __tablename__ = "top_selling_product"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String)
    product_name = Column(String)
    units_sold = Column(Integer)

class VectorType(UserDefinedType):
    def __init__(self, dim=1024):
        self.dim = dim

    def get_col_spec(self, **kw):
        return f"vector({self.dim})"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    passwordHash = Column(String, nullable=True)
    googleId = Column(String, unique=True, nullable=True)
    name = Column(String, nullable=False)
    roleId = Column(String, ForeignKey("roles.id"), nullable=False)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Role(Base):
    __tablename__ = "roles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())

class RolePermission(Base):
    __tablename__ = "role_permissions"

    roleId = Column(String, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
    permissionId = Column(String, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)

class Account(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    company_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    key_hash = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    revoked_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    account_id = Column(String, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(String, nullable=False)
    embedding = Column(VectorType(1024), nullable=False)
    metadata_ = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

class Plan(Base):
    __tablename__ = "plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    rate_limit = Column(Integer, nullable=False)
    burst_limit = Column(Integer, nullable=False)
    refill_rate = Column(Integer, nullable=False)
    monthly_price = Column(Numeric(10, 2), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(String, ForeignKey("plans.id"), nullable=False)
    status = Column(String(20), nullable=False)
    started_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=True)

class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    api_key_id = Column(String, ForeignKey("api_keys.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(String, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    endpoint = Column(String, nullable=True)
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

# Create tables

Base.metadata.create_all(bind=engine)