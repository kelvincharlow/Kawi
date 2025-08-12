import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string;
          registration_number: string;
          make: string;
          model: string;
          year: number;
          fuel_type: string;
          engine_size: string;
          color: string;
          chassis_number: string;
          engine_number: string;
          purchase_date: string;
          purchase_cost: number;
          current_mileage: number;
          status: string;
          department: string;
          assigned_driver_id: string | null;
          insurance_expiry: string;
          last_service_date: string;
          next_service_due: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          registration_number: string;
          make: string;
          model: string;
          year: number;
          fuel_type: string;
          engine_size: string;
          color: string;
          chassis_number: string;
          engine_number: string;
          purchase_date: string;
          purchase_cost: number;
          current_mileage: number;
          status: string;
          department: string;
          assigned_driver_id?: string | null;
          insurance_expiry: string;
          last_service_date: string;
          next_service_due: string;
        };
        Update: {
          registration_number?: string;
          make?: string;
          model?: string;
          year?: number;
          fuel_type?: string;
          engine_size?: string;
          color?: string;
          chassis_number?: string;
          engine_number?: string;
          purchase_date?: string;
          purchase_cost?: number;
          current_mileage?: number;
          status?: string;
          department?: string;
          assigned_driver_id?: string | null;
          insurance_expiry?: string;
          last_service_date?: string;
          next_service_due?: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          name: string;
          license_number: string;
          license_class: string;
          license_expiry: string;
          date_of_birth: string;
          phone: string;
          email: string;
          address: string;
          emergency_contact_name: string;
          emergency_contact_phone: string;
          employment_date: string;
          department: string;
          status: string;
          medical_certificate_expiry: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          license_number: string;
          license_class: string;
          license_expiry: string;
          date_of_birth: string;
          phone: string;
          email: string;
          address: string;
          emergency_contact_name: string;
          emergency_contact_phone: string;
          employment_date: string;
          department: string;
          status: string;
          medical_certificate_expiry: string;
        };
        Update: {
          name?: string;
          license_number?: string;
          license_class?: string;
          license_expiry?: string;
          date_of_birth?: string;
          phone?: string;
          email?: string;
          address?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          employment_date?: string;
          department?: string;
          status?: string;
          medical_certificate_expiry?: string;
        };
      };
      work_tickets: {
        Row: {
          id: string;
          driver_id: string;
          driver_name: string;
          driver_license: string;
          vehicle_id: string;
          vehicle_registration: string;
          destination: string;
          purpose: string;
          fuel_required: number;
          estimated_distance: number;
          departure_date: string;
          return_date: string;
          additional_notes: string;
          status: string;
          created_at: string;
          approved_by: string | null;
          approved_at: string | null;
          rejected_by: string | null;
          rejected_at: string | null;
          rejection_reason: string | null;
          updated_at: string;
        };
        Insert: {
          driver_id: string;
          driver_name: string;
          driver_license: string;
          vehicle_id: string;
          vehicle_registration: string;
          destination: string;
          purpose: string;
          fuel_required: number;
          estimated_distance?: number;
          departure_date?: string;
          return_date?: string;
          additional_notes?: string;
          status?: string;
        };
        Update: {
          driver_id?: string;
          driver_name?: string;
          driver_license?: string;
          vehicle_id?: string;
          vehicle_registration?: string;
          destination?: string;
          purpose?: string;
          fuel_required?: number;
          estimated_distance?: number;
          departure_date?: string;
          return_date?: string;
          additional_notes?: string;
          status?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_by?: string | null;
          rejected_at?: string | null;
          rejection_reason?: string | null;
        };
      };
      bulk_fuel_accounts: {
        Row: {
          id: string;
          account_name: string;
          supplier_name: string;
          account_number: string;
          contact_person: string;
          contact_email: string;
          contact_phone: string;
          initial_balance: number;
          current_balance: number;
          credit_limit: number;
          fuel_types: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          account_name: string;
          supplier_name: string;
          account_number: string;
          contact_person: string;
          contact_email: string;
          contact_phone: string;
          initial_balance: number;
          current_balance: number;
          credit_limit?: number;
          fuel_types: string;
          status?: string;
        };
        Update: {
          account_name?: string;
          supplier_name?: string;
          account_number?: string;
          contact_person?: string;
          contact_email?: string;
          contact_phone?: string;
          initial_balance?: number;
          current_balance?: number;
          credit_limit?: number;
          fuel_types?: string;
          status?: string;
        };
      };
      fuel_records: {
        Row: {
          id: string;
          vehicle_id: string;
          driver_id: string;
          fuel_type: string;
          quantity: number;
          cost_per_liter: number;
          total_cost: number;
          odometer_reading: number;
          fuel_station: string;
          receipt_number: string;
          date: string;
          notes: string;
          bulk_account_id: string | null;
          work_ticket_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          vehicle_id: string;
          driver_id: string;
          fuel_type: string;
          quantity: number;
          cost_per_liter: number;
          total_cost: number;
          odometer_reading: number;
          fuel_station: string;
          receipt_number?: string;
          date: string;
          notes?: string;
          bulk_account_id?: string | null;
          work_ticket_id?: string | null;
        };
        Update: {
          vehicle_id?: string;
          driver_id?: string;
          fuel_type?: string;
          quantity?: number;
          cost_per_liter?: number;
          total_cost?: number;
          odometer_reading?: number;
          fuel_station?: string;
          receipt_number?: string;
          date?: string;
          notes?: string;
          bulk_account_id?: string | null;
          work_ticket_id?: string | null;
        };
      };
      maintenance_records: {
        Row: {
          id: string;
          vehicle_id: string;
          service_type: string;
          description: string;
          cost: number;
          service_provider: string;
          service_date: string;
          next_service_date: string;
          mileage: number;
          parts_replaced: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          vehicle_id: string;
          service_type: string;
          description: string;
          cost: number;
          service_provider: string;
          service_date: string;
          next_service_date?: string;
          mileage: number;
          parts_replaced?: string;
        };
        Update: {
          vehicle_id?: string;
          service_type?: string;
          description?: string;
          cost?: number;
          service_provider?: string;
          service_date?: string;
          next_service_date?: string;
          mileage?: number;
          parts_replaced?: string;
        };
      };
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const endpoint = segments[segments.length - 1];
    
    console.log('=== INCOMING REQUEST ===');
    console.log('Method:', req.method);
    console.log('Full URL:', req.url);
    console.log('Pathname:', url.pathname);
    console.log('Segments:', segments);
    console.log('Endpoint:', endpoint);
    console.log('========================');

    // Health check endpoint
    if (endpoint === 'health' && req.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Server is running',
          timestamp: new Date().toISOString(),
          endpoint: endpoint
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Dashboard Stats
    if (endpoint === 'dashboard-stats' && req.method === 'GET') {
      const [vehiclesResult, driversResult, fuelResult, maintenanceResult, workTicketsResult] = await Promise.all([
        supabaseClient.from('vehicles').select('id', { count: 'exact' }),
        supabaseClient.from('drivers').select('id', { count: 'exact' }),
        supabaseClient.from('fuel_records').select('id', { count: 'exact' }),
        supabaseClient.from('maintenance_records').select('id', { count: 'exact' }),
        supabaseClient.from('work_tickets').select('id, status', { count: 'exact' })
      ]);

      const pendingWorkTickets = workTicketsResult.data?.filter(ticket => ticket.status === 'pending').length || 0;

      return new Response(
        JSON.stringify({
          success: true,
          stats: {
            totalVehicles: vehiclesResult.count || 0,
            totalDrivers: driversResult.count || 0,
            totalFuelRecords: fuelResult.count || 0,
            totalMaintenanceRecords: maintenanceResult.count || 0,
            totalWorkTickets: workTicketsResult.count || 0,
            pendingWorkTickets: pendingWorkTickets,
            lastUpdated: new Date().toISOString()
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Work Tickets CRUD
    if (endpoint === 'work-tickets') {
      if (req.method === 'GET') {
        const { data, error } = await supabaseClient
          .from('work_tickets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Work tickets fetch error:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true, tickets: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'POST') {
        const ticketData = await req.json();
        console.log('Creating work ticket with data:', ticketData);
        
        const { data, error } = await supabaseClient
          .from('work_tickets')
          .insert([{
            ...ticketData,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Work ticket creation error:', error);
          throw error;
        }

        console.log('Work ticket created successfully:', data);

        return new Response(
          JSON.stringify({ success: true, ticket: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Work Ticket Approval
    if (segments.includes('work-tickets') && segments.includes('approve') && req.method === 'POST') {
      const ticketId = segments[segments.indexOf('work-tickets') + 1];
      const approvalData = await req.json();

      const { data, error } = await supabaseClient
        .from('work_tickets')
        .update({
          status: 'approved',
          approved_by: approvalData.approved_by,
          approved_at: approvalData.approved_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, ticket: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Work Ticket Rejection
    if (segments.includes('work-tickets') && segments.includes('reject') && req.method === 'POST') {
      const ticketId = segments[segments.indexOf('work-tickets') + 1];
      const rejectionData = await req.json();

      const { data, error } = await supabaseClient
        .from('work_tickets')
        .update({
          status: 'rejected',
          rejected_by: rejectionData.rejected_by,
          rejected_at: rejectionData.rejected_at,
          rejection_reason: rejectionData.rejection_reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, ticket: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Bulk Fuel Accounts CRUD
    if (endpoint === 'bulk-accounts') {
      console.log('Processing bulk-accounts request, method:', req.method);
      
      if (req.method === 'GET') {
        try {
          const { data, error } = await supabaseClient
            .from('bulk_fuel_accounts')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Bulk accounts fetch error:', error);
            
            // Return empty array if table doesn't exist yet
            if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
              console.log('Table bulk_fuel_accounts does not exist yet, returning empty array');
              return new Response(
                JSON.stringify({ success: true, accounts: [] }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            
            throw error;
          }

          console.log('Successfully fetched bulk accounts:', data?.length || 0, 'records');
          return new Response(
            JSON.stringify({ success: true, accounts: data || [] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (fetchError) {
          console.error('Error in bulk accounts fetch:', fetchError);
          return new Response(
            JSON.stringify({ success: false, error: fetchError.message, accounts: [] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      if (req.method === 'POST') {
        try {
          const accountData = await req.json();
          console.log('Creating bulk account with data:', accountData);
          
          const { data, error } = await supabaseClient
            .from('bulk_fuel_accounts')
            .insert([{
              ...accountData,
              current_balance: accountData.initial_balance,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (error) {
            console.error('Bulk account creation error:', error);
            
            // Return error response instead of throwing
            return new Response(
              JSON.stringify({ success: false, error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('Bulk account created successfully:', data);

          return new Response(
            JSON.stringify({ success: true, account: data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (createError) {
          console.error('Error in bulk account creation:', createError);
          return new Response(
            JSON.stringify({ success: false, error: createError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Individual bulk account operations
    if (segments.includes('bulk-accounts') && segments.length >= 2) {
      const accountId = segments[segments.indexOf('bulk-accounts') + 1];
      
      if (req.method === 'PUT') {
        const updateData = await req.json();
        
        const { data, error } = await supabaseClient
          .from('bulk_fuel_accounts')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', accountId)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, account: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'DELETE') {
        const { error } = await supabaseClient
          .from('bulk_fuel_accounts')
          .delete()
          .eq('id', accountId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fuel Records CRUD
    if (endpoint === 'fuel-records') {
      if (req.method === 'GET') {
        const { data, error } = await supabaseClient
          .from('fuel_records')
          .select(`
            *,
            vehicles!inner(registration_number, make, model),
            drivers!inner(name),
            bulk_fuel_accounts(supplier_name, account_name)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Fuel records fetch error:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true, records: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'POST') {
        const fuelData = await req.json();
        console.log('Creating fuel record with data:', fuelData);

        // Start a transaction to handle fuel record creation and bulk account deduction
        const { data: fuelRecord, error: fuelError } = await supabaseClient
          .from('fuel_records')
          .insert([{
            ...fuelData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (fuelError) {
          console.error('Fuel record creation error:', fuelError);
          throw fuelError;
        }

        // If bulk account is specified, deduct the cost from the account balance
        if (fuelData.bulk_account_id) {
          const { data: account, error: accountFetchError } = await supabaseClient
            .from('bulk_fuel_accounts')
            .select('current_balance')
            .eq('id', fuelData.bulk_account_id)
            .single();

          if (accountFetchError) {
            console.error('Account fetch error:', accountFetchError);
            throw accountFetchError;
          }

          const newBalance = account.current_balance - fuelData.total_cost;

          const { error: balanceUpdateError } = await supabaseClient
            .from('bulk_fuel_accounts')
            .update({
              current_balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('id', fuelData.bulk_account_id);

          if (balanceUpdateError) {
            console.error('Balance update error:', balanceUpdateError);
            throw balanceUpdateError;
          }

          console.log(`Deducted ${fuelData.total_cost} from bulk account. New balance: ${newBalance}`);
        }

        // If work ticket is specified, mark it as completed
        if (fuelData.work_ticket_id) {
          const { error: ticketUpdateError } = await supabaseClient
            .from('work_tickets')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', fuelData.work_ticket_id);

          if (ticketUpdateError) {
            console.error('Work ticket update error:', ticketUpdateError);
          }
        }

        console.log('Fuel record created successfully:', fuelRecord);

        return new Response(
          JSON.stringify({ success: true, record: fuelRecord }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Vehicles CRUD
    if (endpoint === 'vehicles') {
      if (req.method === 'GET') {
        const { data, error } = await supabaseClient
          .from('vehicles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, vehicles: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'POST') {
        const vehicleData = await req.json();
        
        const { data, error } = await supabaseClient
          .from('vehicles')
          .insert([{
            ...vehicleData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, vehicle: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Drivers CRUD
    if (endpoint === 'drivers') {
      if (req.method === 'GET') {
        const { data, error } = await supabaseClient
          .from('drivers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, drivers: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'POST') {
        const driverData = await req.json();
        
        const { data, error } = await supabaseClient
          .from('drivers')
          .insert([{
            ...driverData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, driver: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Maintenance Records CRUD
    if (endpoint === 'maintenance-records') {
      if (req.method === 'GET') {
        const { data, error } = await supabaseClient
          .from('maintenance_records')
          .select(`
            *,
            vehicles!inner(registration_number, make, model)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, records: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'POST') {
        const maintenanceData = await req.json();
        
        const { data, error } = await supabaseClient
          .from('maintenance_records')
          .insert([{
            ...maintenanceData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, record: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Individual vehicle operations
    if (segments.includes('vehicles') && segments.length >= 2) {
      const vehicleId = segments[segments.indexOf('vehicles') + 1];
      
      if (req.method === 'PUT') {
        const updateData = await req.json();
        
        const { data, error } = await supabaseClient
          .from('vehicles')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', vehicleId)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, vehicle: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'DELETE') {
        const { error } = await supabaseClient
          .from('vehicles')
          .delete()
          .eq('id', vehicleId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Individual driver operations
    if (segments.includes('drivers') && segments.length >= 2) {
      const driverId = segments[segments.indexOf('drivers') + 1];
      
      if (req.method === 'PUT') {
        const updateData = await req.json();
        
        const { data, error } = await supabaseClient
          .from('drivers')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', driverId)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, driver: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'DELETE') {
        const { error } = await supabaseClient
          .from('drivers')
          .delete()
          .eq('id', driverId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('No matching endpoint found for:', req.method, url.pathname);
    console.log('Available segments:', segments);
    console.log('Endpoint extracted:', endpoint);
    
    return new Response(
      JSON.stringify({ 
        error: 'Endpoint not found', 
        path: url.pathname,
        method: req.method,
        segments: segments,
        endpoint: endpoint,
        message: `No handler found for ${req.method} ${url.pathname}`
      }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});