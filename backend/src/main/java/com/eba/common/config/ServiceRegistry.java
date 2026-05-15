package com.eba.common.config;

import com.eba.asset.service.AssetService;
import com.eba.asset.service.impl.AssetServiceImpl;
import com.eba.amenity.service.AmenityService;
import com.eba.amenity.service.impl.AmenityServiceImpl;
import com.eba.auth.service.AuthService;
import com.eba.auth.service.impl.AuthServiceImpl;
import com.eba.contact.service.ContactService;
import com.eba.contact.service.impl.ContactServiceImpl;
import com.eba.customer.service.CustomerService;
import com.eba.customer.service.impl.CustomerServiceImpl;
import com.eba.dashboard.service.DashboardService;
import com.eba.dashboard.service.impl.DashboardServiceImpl;
import com.eba.lead.service.LeadService;
import com.eba.lead.service.impl.LeadServiceImpl;
import com.eba.lease.service.LeaseService;
import com.eba.lease.service.impl.LeaseServiceImpl;
import com.eba.opportunity.service.OpportunityService;
import com.eba.opportunity.service.impl.OpportunityServiceImpl;
import com.eba.property.service.PropertyService;
import com.eba.property.service.impl.PropertyServiceImpl;
import com.eba.prospect.service.ProspectService;
import com.eba.prospect.service.impl.ProspectServiceImpl;
import com.eba.reservation.service.ReservationService;
import com.eba.reservation.service.impl.ReservationServiceImpl;
import com.eba.tenant.service.TenantService;
import com.eba.tenant.service.impl.TenantServiceImpl;
import com.eba.tower.service.TowerService;
import com.eba.tower.service.impl.TowerServiceImpl;
import com.eba.unit.service.UnitService;
import com.eba.unit.service.impl.UnitServiceImpl;

public final class ServiceRegistry {
    public static final AuthService AUTH_SERVICE = new AuthServiceImpl();
    public static final DashboardService DASHBOARD_SERVICE = new DashboardServiceImpl();
    public static final PropertyService PROPERTY_SERVICE = new PropertyServiceImpl();
    public static final TowerService TOWER_SERVICE = new TowerServiceImpl();
    public static final UnitService UNIT_SERVICE = new UnitServiceImpl();
    public static final AmenityService AMENITY_SERVICE = new AmenityServiceImpl();
    public static final CustomerService CUSTOMER_SERVICE = new CustomerServiceImpl();
    public static final ContactService CONTACT_SERVICE = new ContactServiceImpl();
    public static final LeaseService LEASE_SERVICE = new LeaseServiceImpl();
    public static final ReservationService RESERVATION_SERVICE = new ReservationServiceImpl();
    public static final TenantService TENANT_SERVICE = new TenantServiceImpl();
    public static final AssetService ASSET_SERVICE = new AssetServiceImpl();
    public static final LeadService LEAD_SERVICE = new LeadServiceImpl();
    public static final OpportunityService OPPORTUNITY_SERVICE = new OpportunityServiceImpl();
    public static final ProspectService PROSPECT_SERVICE = new ProspectServiceImpl();

    private ServiceRegistry() {
    }
}
