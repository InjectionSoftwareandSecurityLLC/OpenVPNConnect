<?php 

namespace pineapple;


/* The class name must be the name of your module, without spaces. */
/* It must also extend the "Module" class. This gives your module access to API functions */
class OpenVPNConnect extends Module{

    public function route(){

        switch ($this->request->action) {

            case 'startVPN':
                $this->startVPN();
                break;
            case 'stopVPN':
                $this->stopVPN();
                break;
            case 'initializeModule':
                $this->initializeModule();
                break;
            case 'handleDependencies':
                $this->handleDependencies();
                break;
            case 'checkDependencies':
                $this->checkDependencies();
                break;
        }
    }

    private function checkDependencies(){

        if($this->checkDependency('openvpn')){
            $installLabel = 'success';
            $installLabelText = 'Installed';
        }else{
            $installLabel = 'danger';
            $installLabelText = 'Not Installed';
        }
         
        $this->response = array("success" => true,
                                "label" => $installLabel,
                                "text"   => $installLabelText);

    }

    private function initializeModule(){

        $result = exec('cd ~ && ls | grep vpn_config');

        if($result == 'vpn_config'){
            $result = "VPN Connect is ready!";
        }else{
            $this->execBackground('cd ~ && mkdir vpn_config');

            $result = exec('cd ~ && ls | grep vpn_config');

            if($result == 'vpn_config'){
                $result = "VPN Connect is ready!";
            }else{
                $result = "VPN Connect setup failed :(";
            }
        }

        
        $this->response = array("success" => true,
                                "content" => $result);

    }

    private function handleDependencies(){
    

        if($this->checkDependency('openvpn')){
            exec('opkg remove openvpn-openssl');
            $messsage = "Dependencies should now be removed! Note: the vpn_config directory is NOT removed in this process. Please wait for the page to refresh...";
        }else{
            $this->installDependency('openvpn-openssl');
            $messsage = "Depedencies should now be installed! Please wait for the page to refresh...";
        }
         
        $this->response = array("success" => true,
                                "content" => $messsage);
    }

    private function startVPN(){

        $inputData = $this->request->data;

        $open_vpn_cmd = "openvpn --config ";
        
        if($inputData[0] != ''){
            $config_name = $inputData[0];
            $open_vpn_cmd .= "/root/vpn_config/" . $config_name . " ";
        }else{
            $this->response = array("success" => false,
                                    "content" => "Please specify a VPN config name..");
            return;
        }

        if($inputData[1] != ''){

            //Create password file for openvpn command to read in
            $config_pass = $inputData[1];
            $pass_file = fopen("/tmp/vpn_pass.txt", "w");
            fwrite($pass_file, $config_pass);
            fclose($pass_file);
            $open_vpn_cmd .= "--auth-nocache --askpass /tmp/vpn_pass.txt ";
        }

        if($inputData[2] != ''){
            $openvpn_flags = $inputData[2];
            $open_vpn_cmd .= $openvpn_flags;
        }


        //Share VPN With Clients Connecting
        $this->execBackground("iptables -t nat -A POSTROUTING -s 172.16.42.0/24 -o tun0 -j MASQUERADE");
        $this->execBackground("iptables -A FORWARD -s 172.16.42.0/24 -o tun0 -j ACCEPT");
        $this->execBackground("iptables -A FORWARD -d 172.16.42.0/24 -m state --state ESTABLISHED,RELATED -i tun0 -j ACCEPT");


        $result = $this->execBackground($open_vpn_cmd);
        
        $this->response = array("success" => true,
                                "content" => "VPN Running... ");
    }


    private function stopVPN(){

        //Remove password file that could have been created, don't want any creds lying around ;)
        unlink("/tmp/vpn_pass.txt");

        exec("pkill openvpn");

        $this->response = array("success" => true,
                                "content" => "VPN Stopped...");
    }

  
}




